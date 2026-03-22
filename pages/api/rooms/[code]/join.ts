import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

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

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, isActive: true },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.isActive) return res.status(400).json({ error: "This room is no longer active" });

    // Upsert so hitting join twice is idempotent
    await prisma.roomInvites.upsert({
      where: { roomId_userId: { roomId: room.id, userId } },
      update: { status: "ACCEPTED" },
      create: { roomId: room.id, userId, status: "ACCEPTED" },
    });

    return res.status(200).json({ message: "Joined room successfully" });
  } catch (err) {
    console.error("[rooms/[code]/join]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
