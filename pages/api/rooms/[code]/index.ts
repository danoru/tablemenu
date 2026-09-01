import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

export interface RoomMember {
  userId: number;
  username: string;
  status: string;
}

export interface RoomSuggestion {
  gameId: number;
  name: string;
  imageUrl: string | null;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  suggestedBy: number | null;
  interestedCount: number;
  vetoCount: number;
  myVote: boolean | null;
  bringing: boolean;
  wishlistedBy: string[];
}

export interface RoomData {
  id: number;
  code: string;
  name: string;
  description: string | null;
  playerCount: number | null;
  timeBudget: number | null;
  isActive: boolean;
  isCompetitive: boolean;
  hostId: number;
  hostUsername: string;
  activeSessionId: number | null;
  lastSessionGameIds: number[];
  members: RoomMember[];
  suggestions: RoomSuggestion[];
  /** Per-userId presence for the ACTIVE session; missing userId → present. */
  attendance: Record<number, boolean>;
}

interface ApiResponse {
  room?: RoomData;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid room code" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const currentUserId = Number((session.user as any).id);

  try {
    // This endpoint is polled every 5s by every open room page — keep the
    // payload to exactly what the suggestion cards render. Full game rows
    // (description + five string arrays) don't belong here; the pool route
    // exists for callers that need them.
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        host: { select: { id: true, username: true } },
        invites: { include: { user: { select: { id: true, username: true } } } },
        gameSuggs: {
          select: {
            gameId: true,
            suggestedBy: true,
            game: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                minPlayers: true,
                maxPlayers: true,
                minPlaytime: true,
                maxPlaytime: true,
              },
            },
          },
        },
        votes: { select: { gameId: true, userId: true, interested: true } },
        sessions: {
          where: { status: "ACTIVE" },
          select: { id: true, attendance: { select: { userId: true, present: true } } },
          take: 1,
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only accepted members (the host is auto-added as one) may read the full
    // roster + members' wishlists. Non-members get nothing beyond a 403.
    const isMember = room.invites.some(
      (inv) => inv.userId === currentUserId && inv.status === "ACCEPTED"
    );
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this room" });
    }

    const lastClosedSession = await prisma.roomSessions.findFirst({
      where: { roomId: room.id, status: "CLOSED" },
      orderBy: { closedAt: "desc" },
      include: {
        gamePlayed: {
          include: { games: { select: { gameId: true } } },
        },
      },
    });

    const lastSessionGameIds =
      lastClosedSession?.gamePlayed.flatMap((gs) => gs.games.map((g) => g.gameId)) ?? [];
    const members: RoomMember[] = room.invites.map((inv) => ({
      userId: inv.user.id,
      username: inv.user.username,
      status: inv.status,
    }));

    const memberIds = room.invites.map((inv) => inv.userId);
    const wishlistEntries = await prisma.userGames.findMany({
      where: {
        gameId: { in: room.gameSuggs.map((s) => s.gameId) },
        userId: { in: memberIds },
        isWishlist: true,
      },
      select: { gameId: true, user: { select: { username: true } } },
    });

    const wishlistMap = new Map<number, string[]>();
    for (const entry of wishlistEntries) {
      const existing = wishlistMap.get(entry.gameId) ?? [];
      existing.push(entry.user.username);
      wishlistMap.set(entry.gameId, existing);
    }

    const suggestions: RoomSuggestion[] = room.gameSuggs.map((sugg) => {
      const gameVotes = room.votes.filter((v) => v.gameId === sugg.gameId);
      const interestedCount = gameVotes.filter((v) => v.interested).length;
      const vetoCount = gameVotes.filter((v) => !v.interested).length;
      const myVoteRecord = currentUserId ? gameVotes.find((v) => v.userId === currentUserId) : null;

      return {
        gameId: sugg.game.id,
        name: sugg.game.name,
        imageUrl: sugg.game.imageUrl,
        minPlayers: sugg.game.minPlayers,
        maxPlayers: sugg.game.maxPlayers,
        minPlaytime: sugg.game.minPlaytime,
        maxPlaytime: sugg.game.maxPlaytime,
        suggestedBy: sugg.suggestedBy,
        interestedCount,
        vetoCount,
        myVote: myVoteRecord ? myVoteRecord.interested : null,
        bringing: sugg.suggestedBy !== null,
        wishlistedBy: wishlistMap.get(sugg.game.id) ?? [],
      };
    });

    const activeSession = room.sessions?.[0] ?? null;
    const attendance: Record<number, boolean> = {};
    for (const row of activeSession?.attendance ?? []) {
      attendance[row.userId] = row.present;
    }

    const roomData: RoomData = {
      id: room.id,
      code: room.code,
      name: room.name,
      description: room.description,
      playerCount: room.playerCount,
      timeBudget: room.timeBudget,
      isActive: room.isActive,
      isCompetitive: room.isCompetitive,
      hostId: room.host.id,
      hostUsername: room.host.username,
      activeSessionId: activeSession?.id ?? null,
      lastSessionGameIds,
      members,
      suggestions,
      attendance,
    };

    res.setHeader("Cache-Control", "private, max-age=5");
    return res.status(200).json({ room: roomData });
  } catch (err) {
    console.error("[rooms/[code]]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
