import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@api/auth/[...nextauth]";
import prisma from "@data/db";
import { checkAchievements } from "@/services/achievements";

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

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, hostId: true },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.hostId !== userId)
      return res.status(403).json({ error: "Only the host can close a session" });

    const activeSession = await prisma.roomSessions.findFirst({
      where: { roomId: room.id, status: "ACTIVE" },
      orderBy: { openedAt: "desc" },
    });

    if (!activeSession) return res.status(400).json({ error: "No active session to close" });

    await prisma.roomSessions.update({
      where: { id: activeSession.id },
      data: { status: "CLOSED", closedAt: new Date() },
    });

    // Clear per-session bringing list and votes so the room is clean next time
    if (req.body.clearSession) {
      await prisma.roomGameSuggestions.deleteMany({ where: { roomId: room.id } });
      await prisma.roomGameVotes.deleteMany({ where: { roomId: room.id } });
    }

    await checkAchievements(userId, { event: "SESSION_CLOSED", sessionId: activeSession.id });

    return res.status(200).json({ message: "Session closed" });
  } catch (err) {
    console.error("[session/close]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
