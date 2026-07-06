import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

export type ViewerStatus = "NONE" | "PENDING" | "ACCEPTED" | "DECLINED";

export interface RoomPreview {
  name: string;
  code: string;
  hostUsername: string;
  memberCount: number;
  visibility: string;
  isActive: boolean;
  viewerStatus: ViewerStatus;
}

interface ApiResponse {
  room?: RoomPreview;
  error?: string;
}

// Lightweight room lookup for viewers who are not (yet) members: the
// join-by-code funnel and pre-join screens. Exposes only what a stranger with
// the code may learn — never the roster, suggestions, or wishlists.
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
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
  const currentUserId = Number((session.user as any).id);

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        name: true,
        code: true,
        visibility: true,
        isActive: true,
        host: { select: { username: true } },
        invites: { select: { userId: true, status: true } },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const viewerInvite = room.invites.find((inv) => inv.userId === currentUserId);
    const viewerStatus: ViewerStatus = (viewerInvite?.status as ViewerStatus) ?? "NONE";
    const memberCount = room.invites.filter((inv) => inv.status === "ACCEPTED").length;

    return res.status(200).json({
      room: {
        name: room.name,
        code: room.code,
        hostUsername: room.host.username,
        memberCount,
        visibility: room.visibility,
        isActive: room.isActive,
        viewerStatus,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching room preview" });
  }
}
