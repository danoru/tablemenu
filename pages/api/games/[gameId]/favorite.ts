import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

// ─── PATCH /api/games/[gameId]/favorite ───────────────────────────────────────
// Toggles isFavorite on the current user's UserGames entry.
// Requires the game to already be in the user's library.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const userId = (session.user as any).id as number;
  const gameId = parseInt(req.query.gameId as string);

  if (isNaN(gameId)) return res.status(400).json({ error: "Invalid gameId" });

  const { isFavorite } = req.body;
  if (typeof isFavorite !== "boolean") {
    return res.status(400).json({ error: "isFavorite must be a boolean" });
  }

  try {
    const existing = await prisma.userGames.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Game not in library" });
    }

    const updated = await prisma.userGames.update({
      where: { userId_gameId: { userId, gameId } },
      data: { isFavorite },
      select: { gameId: true, isFavorite: true },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("[games/favorite]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
