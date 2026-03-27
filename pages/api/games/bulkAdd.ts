import { authOptions } from "@/lib/authOptions";
import type { BGGCollectionGame } from "@api/bgg/collection";
import prisma from "@data/db";
import { checkAchievements } from "@/services/achievements";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

interface ApiResponse {
  added: number;
  skipped: number;
  failed: number;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST")
    return res.status(405).json({ added: 0, skipped: 0, failed: 0, error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user)
    return res.status(401).json({ added: 0, skipped: 0, failed: 0, error: "Not authenticated" });

  const userId = Number((session.user as any).id);
  const { games } = req.body as { games: BGGCollectionGame[] };

  if (!Array.isArray(games) || games.length === 0) {
    return res.status(400).json({ added: 0, skipped: 0, failed: 0, error: "No games provided" });
  }

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const game of games) {
    try {
      // Upsert the game record
      const dbGame = await prisma.games.upsert({
        where: { bggId: game.bggId },
        update: {
          name: game.name,
          imageUrl: game.imageUrl || null,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          minPlaytime: game.minPlaytime,
          maxPlaytime: game.maxPlaytime,
          complexity: game.complexity,
          bggRating: game.bggRating,
          categories: game.categories,
          mechanics: game.mechanics,
          designers: game.designers,
          publishers: game.publishers,
          countries: game.countries,
          bggLastSynced: new Date(),
        },
        create: {
          bggId: game.bggId,
          name: game.name,
          imageUrl: game.imageUrl || null,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          minPlaytime: game.minPlaytime,
          maxPlaytime: game.maxPlaytime,
          complexity: game.complexity ?? null,
          bggRating: game.bggRating ?? null,
          categories: game.categories,
          mechanics: game.mechanics,
          designers: game.designers,
          publishers: game.publishers,
          countries: game.countries,
          yearPublished: game.yearPublished ?? null,
          bggLastSynced: new Date(),
        },
      });

      // Add to user library if not already there
      const existing = await prisma.userGames.findUnique({
        where: { userId_gameId: { userId, gameId: dbGame.id } },
      });

      if (existing) {
        skipped++;
      } else {
        await prisma.userGames.create({ data: { userId, gameId: dbGame.id } });
        added++;
      }
    } catch (err) {
      console.error(`[games/bulkAdd] failed for bggId ${game.bggId}:`, err);
      failed++;
    }
  }

  // Trigger achievement check once after all imports
  if (added > 0) {
    await checkAchievements(userId, { event: "GAME_ADDED" });
  }

  return res.status(200).json({ added, skipped, failed });
}
