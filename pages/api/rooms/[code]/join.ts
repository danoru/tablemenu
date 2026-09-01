import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

interface ApiResponse {
  message?: string;
  error?: string;
  /** ACCEPTED = you're in; PENDING = the host still has to approve you. */
  status?: "ACCEPTED" | "PENDING";
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
      select: { id: true, isActive: true, visibility: true },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.isActive) return res.status(400).json({ error: "This room is no longer active" });

    const existingInvite = await prisma.roomInvites.findUnique({
      where: { roomId_userId: { roomId: room.id, userId } },
      select: { status: true },
    });

    if (existingInvite?.status === "ACCEPTED") {
      return res.status(200).json({ message: "You're already at this table", status: "ACCEPTED" });
    }

    // PUBLIC and LINK_ONLY rooms admit anyone holding the code. INVITE_ONLY
    // rooms don't: the code only buys you a request the host has to approve,
    // which is what the visibility toggle has always promised. Never promote
    // your own PENDING row here — that would let a requester wave themselves
    // through the door they just knocked on.
    if (room.visibility === "INVITE_ONLY") {
      if (existingInvite?.status === "DECLINED") {
        return res.status(403).json({ error: "The host declined your request to join" });
      }
      if (existingInvite?.status === "PENDING") {
        return res
          .status(200)
          .json({ message: "Your request is waiting on the host", status: "PENDING" });
      }

      // Upsert, not create: a double-click races past the existence check
      // above, and the second insert died on the unique constraint as a 500.
      await prisma.roomInvites.upsert({
        where: { roomId_userId: { roomId: room.id, userId } },
        update: {},
        create: { roomId: room.id, userId, status: "PENDING" },
      });

      return res.status(200).json({ message: "Request sent to the host", status: "PENDING" });
    }

    await prisma.roomInvites.upsert({
      where: { roomId_userId: { roomId: room.id, userId } },
      update: { status: "ACCEPTED" },
      create: { roomId: room.id, userId, status: "ACCEPTED" },
    });

    return res.status(200).json({ message: "Joined room successfully", status: "ACCEPTED" });
  } catch (err) {
    console.error("[rooms/[code]/join]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
