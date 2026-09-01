import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

interface MembersBody {
  userId: number;
  /** approve → ACCEPTED, decline → DECLINED, remove → invite row deleted. */
  action: "approve" | "decline" | "remove";
}

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid room code" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const callerId = Number((session.user as any).id);
  const { userId, action } = (req.body ?? {}) as MembersBody;

  if (!userId || !Number.isInteger(Number(userId))) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  if (!["approve", "decline", "remove"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, hostId: true, isActive: true },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.isActive) return res.status(400).json({ error: "This room is no longer active" });
    if (room.hostId !== callerId) {
      return res.status(403).json({ error: "Only the host can manage members" });
    }
    // The host's own ACCEPTED row is what makes the room readable to them.
    if (Number(userId) === room.hostId) {
      return res.status(400).json({ error: "The host can't be removed from their own room" });
    }

    const invite = await prisma.roomInvites.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: Number(userId) } },
      select: { id: true },
    });
    if (!invite) return res.status(404).json({ error: "No such request" });

    if (action === "remove") {
      await prisma.roomInvites.delete({ where: { id: invite.id } });
      return res.status(200).json({ message: "Removed from the table" });
    }

    await prisma.roomInvites.update({
      where: { id: invite.id },
      data: { status: action === "approve" ? "ACCEPTED" : "DECLINED" },
    });

    return res
      .status(200)
      .json({ message: action === "approve" ? "Request approved" : "Request declined" });
  } catch (err) {
    console.error("[rooms/[code]/members]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
