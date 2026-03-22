import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import { checkAchievements } from "@/services/achievements";

interface ApiResponse {
  sessionId?: number;
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
      select: { id: true, hostId: true, isActive: true, playerCount: true },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.isActive) return res.status(400).json({ error: "Room is not active" });
    if (room.hostId !== userId)
      return res.status(403).json({ error: "Only the host can open a session" });

    // Close any previously open session for this room (shouldn't happen but safe)
    await prisma.roomSessions.updateMany({
      where: { roomId: room.id, status: "ACTIVE" },
      data: { status: "CLOSED", closedAt: new Date() },
    });

    const roomSession = await prisma.roomSessions.create({
      data: {
        roomId: room.id,
        hostId: userId,
        status: "ACTIVE",
        openedAt: new Date(),
        playerCount: req.body.playerCount ?? room.playerCount,
      },
    });

    // Update lastOpenedAt on the room for streak tracking
    await prisma.rooms.update({
      where: { id: room.id },
      data: { lastOpenedAt: new Date() },
    });

    await checkAchievements(userId, { event: "SESSION_OPENED" });

    return res.status(201).json({ sessionId: roomSession.id });
  } catch (err) {
    console.error("[session/open]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
