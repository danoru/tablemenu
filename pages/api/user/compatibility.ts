import { authOptions } from "@/lib/authOptions";
import { buildCompatibility, type Compatibility } from "@/services/compatibility";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { getUserGamesForTaste } from "@/data/games";

interface ApiResponse {
  compatibility?: Compatibility;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const meId = Number((session.user as any).id);
  const targetUsername = typeof req.query.username === "string" ? req.query.username : null;
  if (!targetUsername) {
    return res.status(400).json({ error: "Missing username." });
  }

  try {
    const target = await prisma.users.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    });
    if (!target) return res.status(404).json({ error: "User not found." });
    if (target.id === meId) return res.status(400).json({ error: "Cannot compare with self." });

    const [meGames, themGames] = await Promise.all([
      getUserGamesForTaste(meId),
      getUserGamesForTaste(target.id),
    ]);

    const compatibility = buildCompatibility(meGames, themGames);
    return res.status(200).json({ compatibility });
  } catch (err) {
    console.error("[user/compatibility]", err);
    return res.status(500).json({ error: "Failed to compute compatibility." });
  }
}
