import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import { customAlphabet } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

// ─── Room code generator ──────────────────────────────────────────────────────
// Uppercase letters + numbers only, no ambiguous chars (0/O, 1/I/l)
// 6 characters gives 36^6 = ~2.1 billion combinations — plenty for our scale

const generateCode = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

interface CreateRoomBody {
  name: string;
  description?: string;
  playerCount?: number;
  timeBudget?: number;
}

interface ApiResponse {
  code?: string;
  roomId?: number;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const hostId = Number((session.user as any).id);
  const { name, description, playerCount, timeBudget } = req.body as CreateRoomBody;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Room name is required" });
  }

  try {
    // Generate a unique code — retry up to 5 times on collision (extremely rare)
    let code = "";
    let attempts = 0;
    while (attempts < 5) {
      const candidate = generateCode();
      const existing = await prisma.rooms.findUnique({ where: { code: candidate } });
      if (!existing) {
        code = candidate;
        break;
      }
      attempts++;
    }

    if (!code) {
      return res.status(500).json({ error: "Failed to generate unique room code" });
    }

    const room = await prisma.rooms.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        hostId,
        code,
        playerCount: playerCount || null,
        timeBudget: timeBudget || null,
        isActive: true,
      },
    });

    // Auto-accept the host as a room member via RoomInvites
    await prisma.roomInvites.create({
      data: {
        roomId: room.id,
        userId: hostId,
        status: "ACCEPTED",
      },
    });

    return res.status(201).json({ code: room.code, roomId: room.id });
  } catch (err) {
    console.error("[rooms/create]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
