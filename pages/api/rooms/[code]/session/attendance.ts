import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";

interface ApiResponse {
  message?: string;
  error?: string;
}

/**
 * Toggle a member's "here tonight" flag for the room's ACTIVE session.
 * Convention: a missing row means present. The host may toggle anyone; a
 * member may only toggle themselves.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.query;
  if (!code || typeof code !== "string")
    return res.status(400).json({ error: "Invalid room code" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const callerId = Number((session.user as any).id);
  const { userId, present } = req.body as { userId?: unknown; present?: unknown };
  const targetId = Number(userId);
  if (!Number.isInteger(targetId) || typeof present !== "boolean") {
    return res.status(400).json({ error: "userId and present are required" });
  }

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, hostId: true },
    });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const callerMembership = await prisma.roomInvites.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: callerId } },
    });
    if (!callerMembership || callerMembership.status !== "ACCEPTED") {
      return res.status(403).json({ error: "You are not a member of this room" });
    }

    const isHost = room.hostId === callerId;
    if (!isHost && targetId !== callerId) {
      return res.status(403).json({ error: "You can only change your own attendance" });
    }

    // The target must be an accepted member of the room.
    const targetMembership = await prisma.roomInvites.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: targetId } },
    });
    if (!targetMembership || targetMembership.status !== "ACCEPTED") {
      return res.status(400).json({ error: "That user is not a member of this room" });
    }

    const activeSession = await prisma.roomSessions.findFirst({
      where: { roomId: room.id, status: "ACTIVE" },
      orderBy: { openedAt: "desc" },
      select: { id: true },
    });
    if (!activeSession) return res.status(400).json({ error: "No active session" });

    await prisma.roomSessionAttendance.upsert({
      where: { sessionId_userId: { sessionId: activeSession.id, userId: targetId } },
      update: { present },
      create: { sessionId: activeSession.id, userId: targetId, present },
    });

    return res.status(200).json({ message: "Attendance updated" });
  } catch (err) {
    console.error("[session/attendance]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
