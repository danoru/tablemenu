import { authOptions } from "@api/auth/[...nextauth]";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  // vote tallies
  interestedCount: number;
  vetoCount: number;
  // current user's vote
  myVote: boolean | null;
  // is the suggesting member bringing this game tonight?
  bringing: boolean;
}

export interface RoomData {
  id: number;
  code: string;
  name: string;
  description: string | null;
  playerCount: number | null;
  timeBudget: number | null;
  isActive: boolean;
  hostId: number;
  hostUsername: string;
  activeSessionId: number | null;
  members: RoomMember[];
  suggestions: RoomSuggestion[];
}

interface ApiResponse {
  room?: RoomData;
  error?: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid room code" });
  }

  const session = await getServerSession(req, res, authOptions);
  const currentUserId = session ? Number((session.user as any).id) : null;

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        host: { select: { id: true, username: true } },
        invites: { include: { user: { select: { id: true, username: true } } } },
        gameSuggs: { include: { game: true, room: false } },
        votes: true,
        sessions: { where: { status: "ACTIVE" }, select: { id: true }, take: 1 }, // ← add this
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // ── Members ───────────────────────────────────────────────────────────────
    const members: RoomMember[] = room.invites.map((inv) => ({
      userId: inv.user.id,
      username: inv.user.username,
      status: inv.status,
    }));

    // ── Suggestions with vote tallies ─────────────────────────────────────────
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
      };
    });

    const roomData: RoomData = {
      id: room.id,
      code: room.code,
      name: room.name,
      description: room.description,
      playerCount: room.playerCount,
      timeBudget: room.timeBudget,
      isActive: room.isActive,
      hostId: room.host.id,
      hostUsername: room.host.username,
      activeSessionId: room.sessions?.[0]?.id ?? null,
      members,
      suggestions,
    };

    // Short cache for polling — 5s max age so clients get fresh data quickly
    res.setHeader("Cache-Control", "private, max-age=5");
    return res.status(200).json({ room: roomData });
  } catch (err) {
    console.error("[rooms/[code]]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
