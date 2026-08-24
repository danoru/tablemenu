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
  isCompetitive?: boolean;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

const ROOM_TYPES = ["CASUAL", "RECURRING"] as const;
const VISIBILITIES = ["PUBLIC", "INVITE_ONLY"] as const;

const MAX_NAME = 80;
const MAX_DESCRIPTION = 500;

/** A positive whole number, or null to clear. Anything else is rejected. */
function optionalCount(value: unknown): { ok: true; value: number | null } | { ok: false } {
  if (value === null) return { ok: true, value: null };
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) return { ok: false };
  return { ok: true, value };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
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
      return res.status(403).json({ error: "Only the host can modify this room" });

    if (req.method === "PUT") {
      const { name, description, playerCount, timeBudget, type, visibility, isCompetitive } =
        (req.body ?? {}) as UpdateRoomBody;

      // Everything below used to go straight into Prisma. An out-of-enum
      // `type`, a string `playerCount`, or an over-long name threw at the
      // driver — and with no try/catch that surfaced as an unhandled 500.
      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim())
          return res.status(400).json({ error: "Room name cannot be empty" });
        if (name.trim().length > MAX_NAME)
          return res
            .status(400)
            .json({ error: `Room name must be ${MAX_NAME} characters or fewer` });
      }
      if (description !== undefined && description !== null) {
        if (typeof description !== "string")
          return res.status(400).json({ error: "Description must be text" });
        if (description.trim().length > MAX_DESCRIPTION)
          return res
            .status(400)
            .json({ error: `Description must be ${MAX_DESCRIPTION} characters or fewer` });
      }
      if (type !== undefined && !ROOM_TYPES.includes(type)) {
        return res.status(400).json({ error: "Invalid room type" });
      }
      if (visibility !== undefined && !VISIBILITIES.includes(visibility)) {
        return res.status(400).json({ error: "Invalid visibility" });
      }
      if (isCompetitive !== undefined && typeof isCompetitive !== "boolean") {
        return res.status(400).json({ error: "isCompetitive must be a boolean" });
      }

      const players = playerCount === undefined ? undefined : optionalCount(playerCount);
      if (players && !players.ok)
        return res.status(400).json({ error: "Player count must be a positive whole number" });

      const budget = timeBudget === undefined ? undefined : optionalCount(timeBudget);
      if (budget && !budget.ok)
        return res.status(400).json({ error: "Time budget must be a positive whole number" });

      await prisma.rooms.update({
        where: { id: room.id },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(players?.ok && { playerCount: players.value }),
          ...(budget?.ok && { timeBudget: budget.value }),
          ...(type !== undefined && { type }),
          ...(visibility !== undefined && { visibility }),
          ...(isCompetitive !== undefined && { isCompetitive }),
        },
      });

      return res.status(200).json({ message: "Room updated" });
    }

    if (req.method === "DELETE") {
      await prisma.rooms.update({
        where: { id: room.id },
        data: { isActive: false },
      });

      return res.status(200).json({ message: "Room archived" });
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error("[rooms/[code]/settings]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
