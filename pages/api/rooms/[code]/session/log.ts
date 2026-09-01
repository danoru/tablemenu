import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import { checkAchievements } from "@/services/achievements";

interface LoggedGame {
  gameId: number;
  durationMin: number | null;
  winnerIds: number[];
  playerIds: number[];
}

interface LogSessionBody {
  games: LoggedGame[];
  notes?: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.query;
  if (!code || typeof code !== "string")
    return res.status(400).json({ error: "Invalid room code" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const userId = Number((session.user as any).id);
  const { games, notes } = req.body as LogSessionBody;

  if (!games?.length) return res.status(400).json({ error: "At least one game is required" });

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, hostId: true },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.hostId !== userId)
      return res.status(403).json({ error: "Only the host can log games" });

    // ── Validate up front ────────────────────────────────────────────────
    // Attributed players must be ACCEPTED members of the room (validated
    // against members, not attendees — a surprise guest shouldn't block a
    // log). Winners must be a subset of players. Every gameId must exist.
    const acceptedMembers = await prisma.roomInvites.findMany({
      where: { roomId: room.id, status: "ACCEPTED" },
      select: { userId: true },
    });
    const memberIds = new Set(acceptedMembers.map((m) => m.userId));
    // The host is always an implicit player even if not in the invite list.
    memberIds.add(userId);

    const gameIds = [...new Set(games.map((g) => g.gameId))];
    const existingGames = await prisma.games.findMany({
      where: { id: { in: gameIds } },
      select: { id: true },
    });
    const existingGameIds = new Set(existingGames.map((g) => g.id));

    for (const g of games) {
      if (!existingGameIds.has(g.gameId)) {
        return res.status(400).json({ error: `Unknown game (id ${g.gameId})` });
      }
      for (const pid of g.playerIds) {
        if (!memberIds.has(pid)) {
          return res.status(400).json({ error: `Player ${pid} is not a room member` });
        }
      }
      for (const wid of g.winnerIds) {
        if (!g.playerIds.includes(wid)) {
          return res.status(400).json({ error: "Winners must be among the game's players" });
        }
      }
    }

    const roomSession = await prisma.roomSessions.findFirst({
      where: { roomId: room.id, status: { in: ["ACTIVE", "CLOSED"] } },
      orderBy: { openedAt: "desc" },
    });

    // ── Write all games atomically ───────────────────────────────────────
    const playerIdsByGame: number[][] = [];
    const createdSessionIds: number[] = [];
    await prisma.$transaction(async (tx) => {
      for (const loggedGame of games) {
        const gameSession = await tx.gameSessions.create({
          data: {
            playedAt: new Date(),
            durationMin: loggedGame.durationMin,
            notes: notes ?? null,
            roomSessionId: roomSession?.id ?? null,
          },
        });

        await tx.gameSessionGames.create({
          data: { gameSessionId: gameSession.id, gameId: loggedGame.gameId },
        });

        const allPlayerIds = [...new Set([...loggedGame.playerIds, userId])];
        await tx.gameSessionPlayers.createMany({
          data: allPlayerIds.map((pid) => ({
            gameSessionId: gameSession.id,
            userId: pid,
            won: loggedGame.winnerIds.includes(pid)
              ? true
              : loggedGame.winnerIds.length > 0
                ? false
                : null,
          })),
          skipDuplicates: true,
        });

        createdSessionIds.push(gameSession.id);
        playerIdsByGame.push(allPlayerIds);
      }
    });

    // Achievements run outside the transaction — they're fire-safe (internally
    // try/caught) and must not roll back a committed log. One check per unique
    // player: the SESSION_CLOSED checks recompute from the player's whole
    // history, so per-game repeats were identical work (a 3-game night for 6
    // players ran 18 full passes before the host got a response).
    const uniquePlayerIds = new Set(playerIdsByGame.flat());
    for (const pid of uniquePlayerIds) {
      await checkAchievements(pid, {
        event: "SESSION_CLOSED",
        sessionId: createdSessionIds[createdSessionIds.length - 1],
      });
    }

    return res.status(201).json({ message: "Games logged successfully" });
  } catch (err) {
    console.error("[session/log]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
