import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

type Action =
  | { type: "bring"; gameId: number }
  | { type: "vote"; gameId: number; interested: boolean }
  | { type: "remove"; gameId: number };

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
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

  const userId = Number((session.user as any).id);
  const action = req.body as Action;

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, isActive: true, hostId: true },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.isActive) return res.status(400).json({ error: "Room is no longer active" });

    const membership = await prisma.roomInvites.findUnique({
      where: { roomId_userId: { roomId: room.id, userId } },
    });
    if (!membership || membership.status !== "ACCEPTED") {
      return res.status(403).json({ error: "You are not a member of this room" });
    }

    if (action.type === "bring") {
      const existing = await prisma.roomGameSuggestions.findUnique({
        where: { roomId_gameId: { roomId: room.id, gameId: action.gameId } },
      });

      if (existing) {
        if (existing.suggestedBy !== userId) {
          return res.status(403).json({ error: "You can only remove games you added" });
        }
        await prisma.roomGameSuggestions.delete({
          where: { roomId_gameId: { roomId: room.id, gameId: action.gameId } },
        });
        return res.status(200).json({ message: "Game removed from tonight's list" });
      } else {
        await prisma.roomGameSuggestions.create({
          data: { roomId: room.id, gameId: action.gameId, suggestedBy: userId },
        });
        return res.status(200).json({ message: "Game added to tonight's list" });
      }
    }

    // The host clears the table; anyone else may only take back their own game
    // (handled by "bring" above). This branch was declared in the Action union
    // but never implemented, so the request fell through to "Invalid action".
    if (action.type === "remove") {
      if (room.hostId !== userId) {
        return res.status(403).json({ error: "Only the host can remove another player's game" });
      }
      const removed = await prisma.roomGameSuggestions.deleteMany({
        where: { roomId: room.id, gameId: action.gameId },
      });
      if (removed.count === 0) {
        return res.status(404).json({ error: "That game isn't on the table" });
      }
      // Votes for a game that's no longer on the table would otherwise linger
      // and reappear if someone brings it back.
      await prisma.roomGameVotes.deleteMany({ where: { roomId: room.id, gameId: action.gameId } });
      return res.status(200).json({ message: "Game removed from tonight's list" });
    }

    if (action.type === "vote") {
      await prisma.roomGameVotes.upsert({
        where: {
          roomId_gameId_userId: {
            roomId: room.id,
            gameId: action.gameId,
            userId,
          },
        },
        update: { interested: action.interested },
        create: {
          roomId: room.id,
          gameId: action.gameId,
          userId,
          interested: action.interested,
        },
      });
      return res.status(200).json({ message: "Vote recorded" });
    }

    return res.status(400).json({ error: "Invalid action type" });
  } catch (err) {
    console.error("[rooms/[code]/games]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
