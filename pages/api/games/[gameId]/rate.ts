import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

// ─── POST /api/games/[gameId]/rate ────────────────────────────────────────────
// Upserts a UserGameRatings row for the current user.
// Stars must be 1–5. Review is optional.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const userId = (session.user as any).id as number;
  const gameId = parseInt(req.query.gameId as string);

  if (isNaN(gameId)) return res.status(400).json({ error: "Invalid gameId" });

  const { stars, review } = req.body;

  if (typeof stars !== "number" || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
    return res.status(400).json({ error: "stars must be an integer between 1 and 5" });
  }

  if (review !== undefined && review !== null && typeof review !== "string") {
    return res.status(400).json({ error: "review must be a string or null" });
  }

  try {
    // Verify game exists
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: { id: true },
    });
    if (!game) return res.status(404).json({ error: "Game not found" });

    const rating = await prisma.userGameRatings.upsert({
      where: { userId_gameId: { userId, gameId } },
      create: {
        userId,
        gameId,
        stars,
        review: review || null,
        ratedAt: new Date(),
      },
      update: {
        stars,
        review: review || null,
        ratedAt: new Date(),
      },
      select: { gameId: true, stars: true, review: true, ratedAt: true },
    });

    return res.status(200).json(rating);
  } catch (err) {
    console.error("[games/rate]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
