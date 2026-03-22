import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@api/auth/[...nextauth]";
import prisma from "@data/db";
import { checkAchievements } from "@/services/achievements";

interface LoggedGame {
  gameId: number;
  durationMin: number | null;
  winnerIds: number[]; // userIds of winners, empty = not tracked
  playerIds: number[]; // all userIds who played
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

    // Find the active or most recent session to attach logs to
    const roomSession = await prisma.roomSessions.findFirst({
      where: { roomId: room.id, status: { in: ["ACTIVE", "CLOSED"] } },
      orderBy: { openedAt: "desc" },
    });

    for (const loggedGame of games) {
      // Create a GameSession per game played
      const gameSession = await prisma.gameSessions.create({
        data: {
          playedAt: new Date(),
          durationMin: loggedGame.durationMin,
          notes: notes ?? null,
          roomSessionId: roomSession?.id ?? null,
        },
      });

      // Link the game
      await prisma.gameSessionGames.create({
        data: { gameSessionId: gameSession.id, gameId: loggedGame.gameId },
      });

      // Link all players, marking winners
      const allPlayerIds = [...new Set([...loggedGame.playerIds, userId])];
      await prisma.gameSessionPlayers.createMany({
        data: allPlayerIds.map((pid) => ({
          gameSessionId: gameSession.id,
          userId: pid,
          won: loggedGame.winnerIds.includes(pid)
            ? true
            : loggedGame.winnerIds.length > 0
              ? false
              : null, // null = not tracked
        })),
        skipDuplicates: true,
      });

      // Trigger play achievements for each participant
      for (const pid of allPlayerIds) {
        await checkAchievements(pid, { event: "SESSION_CLOSED", sessionId: gameSession.id });
      }
    }

    return res.status(201).json({ message: "Games logged successfully" });
  } catch (err) {
    console.error("[session/log]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
