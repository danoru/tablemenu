import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import { checkAchievements } from "@/services/achievements";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddGameBody {
  bggId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  complexity?: number | null;
  bggRating?: number | null;
  categories?: string[];
  mechanics: string[];
  designers: string[];
  publishers: string[];
  countries: string[];
}

interface ApiResponse {
  userGameId?: number;
  gameId?: number;
  alreadyInLibrary?: boolean;
  error?: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = Number((session.user as any).id);

  const {
    bggId,
    name,
    description,
    imageUrl,
    minPlayers,
    maxPlayers,
    minPlaytime,
    maxPlaytime,
    complexity,
    bggRating,
    categories,
    mechanics,
    designers,
    publishers,
    countries,
  } = req.body as AddGameBody;

  if (!name || minPlayers == null || maxPlayers == null) {
    return res.status(400).json({ error: "Missing required game fields" });
  }

  try {
    const game = await prisma.games.upsert({
      where: {
        bggId: bggId ?? -1,
      },
      update: {
        name,
        description,
        imageUrl,
        minPlayers,
        maxPlayers,
        minPlaytime,
        maxPlaytime,
        complexity,
        bggRating,
        categories: categories ?? [],
        bggLastSynced: new Date(),
        mechanics,
        designers,
        publishers,
        countries,
      },
      create: {
        bggId: bggId ?? null,
        name,
        description,
        imageUrl,
        minPlayers,
        maxPlayers,
        minPlaytime,
        maxPlaytime,
        complexity: complexity ?? null,
        bggRating: bggRating ?? null,
        categories: categories ?? [],
        bggLastSynced: bggId ? new Date() : null,
        mechanics,
        designers,
        publishers,
        countries,
      },
    });

    // ── Add to user's library ─────────────────────────────────────────────────
    const existing = await prisma.userGames.findUnique({
      where: { userId_gameId: { userId, gameId: game.id } },
    });

    if (existing) {
      return res.status(200).json({
        userGameId: existing.id,
        gameId: game.id,
        alreadyInLibrary: true,
      });
    }

    const userGame = await prisma.userGames.create({
      data: { userId, gameId: game.id },
    });

    await checkAchievements(userId, { event: "GAME_ADDED" });

    return res.status(201).json({
      userGameId: userGame.id,
      gameId: game.id,
      alreadyInLibrary: false,
    });
  } catch (err) {
    console.error("[games/add]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
