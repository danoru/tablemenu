import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LibraryGame {
  userGameId: number;
  gameId: number;
  addedAt: string;
  weight: number;
  notes: string | null;
  bggId: number | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isFavorite: boolean;
  isWishlist: boolean;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  complexity: number | null;
  bggRating: number | null;
  categories: string[];
  userStars: number | null;
  yearPublished: number | null;
  mechanics: string[];
  designers: string[];
  publishers: string[];
}

interface ApiResponse {
  library?: LibraryGame[];
  error?: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = (session.user as any).id as number;

  try {
    const userGames = await prisma.userGames.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
      include: {
        game: true,
      },
    });

    const ratings = await prisma.userGameRatings.findMany({
      where: { userId },
      select: { gameId: true, stars: true },
    });
    const ratingMap = new Map(ratings.map((r) => [r.gameId, r.stars]));

    const library: LibraryGame[] = userGames.map((ug) => ({
      userGameId: ug.id,
      gameId: ug.gameId,
      addedAt: ug.addedAt.toISOString(),
      weight: ug.weight,
      notes: ug.notes,
      bggId: ug.game.bggId,
      name: ug.game.name,
      description: ug.game.description,
      imageUrl: ug.game.imageUrl,
      isFavorite: ug.isFavorite,
      isWishlist: ug.isWishlist,
      minPlayers: ug.game.minPlayers,
      maxPlayers: ug.game.maxPlayers,
      minPlaytime: ug.game.minPlaytime,
      maxPlaytime: ug.game.maxPlaytime,
      complexity: ug.game.complexity,
      bggRating: ug.game.bggRating,
      categories: ug.game.categories,
      yearPublished: ug.game.yearPublished,
      mechanics: ug.game.mechanics,
      designers: ug.game.designers,
      publishers: ug.game.publishers,
      userStars: ratingMap.get(ug.gameId) ?? null,
    }));

    return res.status(200).json({ library });
  } catch (err) {
    console.error("[games/library]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
