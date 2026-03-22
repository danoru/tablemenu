import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";

interface UpdateRoomBody {
  name?: string;
  description?: string;
  playerCount?: number | null;
  timeBudget?: number | null;
  type?: "CASUAL" | "RECURRING";
  visibility?: "PUBLIC" | "INVITE_ONLY";
}

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { code } = req.query;
  if (!code || typeof code !== "string")
    return res.status(400).json({ error: "Invalid room code" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const userId = Number((session.user as any).id);

  // Verify the requester is the host
  const room = await prisma.rooms.findUnique({
    where: { code: code.toUpperCase() },
    select: { id: true, hostId: true },
  });

  if (!room) return res.status(404).json({ error: "Room not found" });
  if (room.hostId !== userId)
    return res.status(403).json({ error: "Only the host can modify this room" });

  // ── PUT — update room settings ───────────────────────────────────────────

  if (req.method === "PUT") {
    const { name, description, playerCount, timeBudget, type, visibility } =
      req.body as UpdateRoomBody;

    if (name !== undefined && !name.trim())
      return res.status(400).json({ error: "Room name cannot be empty" });

    await prisma.rooms.update({
      where: { id: room.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(playerCount !== undefined && { playerCount }),
        ...(timeBudget !== undefined && { timeBudget }),
        ...(type !== undefined && { type }),
        ...(visibility !== undefined && { visibility }),
      },
    });

    return res.status(200).json({ message: "Room updated" });
  }

  // ── DELETE — archive (soft delete) ───────────────────────────────────────

  if (req.method === "DELETE") {
    // Soft delete — sets isActive to false rather than destroying data.
    // Hard delete can be added later if needed.
    await prisma.rooms.update({
      where: { id: room.id },
      data: { isActive: false },
    });

    return res.status(200).json({ message: "Room archived" });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
