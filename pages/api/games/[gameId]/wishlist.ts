import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

// ─── PATCH /api/games/[gameId]/wishlist ───────────────────────────────────────
// Toggles isWishlist on the current user's UserGames entry.
// If the game isn't in the library yet, creates a wishlist-only entry.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const userId = (session.user as any).id as number;
  const gameId = parseInt(req.query.gameId as string);

  if (isNaN(gameId)) return res.status(400).json({ error: "Invalid gameId" });

  const { isWishlist } = req.body;
  if (typeof isWishlist !== "boolean") {
    return res.status(400).json({ error: "isWishlist must be a boolean" });
  }

  try {
    // Upsert — wishlist can be added even if not yet in the owned library
    const updated = await prisma.userGames.upsert({
      where: { userId_gameId: { userId, gameId } },
      create: {
        userId,
        gameId,
        isWishlist,
      },
      update: {
        isWishlist,
      },
      select: { gameId: true, isWishlist: true },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("[games/wishlist]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
