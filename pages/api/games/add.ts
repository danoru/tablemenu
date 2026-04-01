import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import { checkAchievements } from "@/services/achievements";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

interface AddGameBody {
  gameId?: number;
  bggId?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  minPlayers?: number;
  maxPlayers?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  complexity?: number | null;
  bggRating?: number | null;
  categories?: string[];
  mechanics?: string[];
  designers?: string[];
  publishers?: string[];
  countries?: string[];
  yearPublished?: number | null;
}

interface ApiResponse {
  userGameId?: number;
  gameId?: number;
  alreadyInLibrary?: boolean;
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

  const userId = Number((session.user as any).id);
  const body = req.body as AddGameBody;

  try {
    let gameId: number;

    if (body.gameId && !body.bggId) {
      const existing = await prisma.games.findUnique({ where: { id: body.gameId } });
      if (!existing) return res.status(404).json({ error: "Game not found" });
      gameId = existing.id;
    } else {
      const { bggId, name, minPlayers, maxPlayers } = body;

      if (!name || minPlayers == null || maxPlayers == null) {
        return res.status(400).json({ error: "Missing required game fields" });
      }

      const game = await prisma.games.upsert({
        where: { bggId: bggId ?? -1 },
        update: {
          name,
          description: body.description,
          imageUrl: body.imageUrl,
          minPlayers,
          maxPlayers,
          minPlaytime: body.minPlaytime,
          maxPlaytime: body.maxPlaytime,
          complexity: body.complexity,
          bggRating: body.bggRating,
          categories: body.categories ?? [],
          bggLastSynced: new Date(),
          mechanics: body.mechanics ?? [],
          designers: body.designers ?? [],
          publishers: body.publishers ?? [],
          countries: body.countries ?? [],
        },
        create: {
          bggId: bggId ?? null,
          name,
          description: body.description,
          imageUrl: body.imageUrl,
          minPlayers,
          maxPlayers,
          minPlaytime: body.minPlaytime ?? 0,
          maxPlaytime: body.maxPlaytime ?? 0,
          complexity: body.complexity ?? null,
          bggRating: body.bggRating ?? null,
          categories: body.categories ?? [],
          bggLastSynced: bggId ? new Date() : null,
          mechanics: body.mechanics ?? [],
          designers: body.designers ?? [],
          publishers: body.publishers ?? [],
          countries: body.countries ?? [],
        },
      });

      gameId = game.id;
    }

    const existingUserGame = await prisma.userGames.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existingUserGame) {
      return res.status(200).json({
        userGameId: existingUserGame.id,
        gameId,
        alreadyInLibrary: !existingUserGame.isWishlist,
      });
    }

    const userGame = await prisma.userGames.create({
      data: { userId, gameId },
    });

    await checkAchievements(userId, { event: "GAME_ADDED" });

    return res.status(201).json({
      userGameId: userGame.id,
      gameId,
      alreadyInLibrary: false,
    });
  } catch (err) {
    console.error("[games/add]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
