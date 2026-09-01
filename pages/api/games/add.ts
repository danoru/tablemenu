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

      // The image URL is rendered as an <img src> to every user who sees this
      // game — accept only real http(s) URLs.
      if (body.imageUrl) {
        let parsed: URL;
        try {
          parsed = new URL(body.imageUrl);
        } catch {
          return res.status(400).json({ error: "imageUrl must be a valid URL" });
        }
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          return res.status(400).json({ error: "imageUrl must be an http(s) URL" });
        }
      }

      // `update: {}` on purpose: the Games table is a shared catalogue, and the
      // request body is client-supplied — updating an existing row from it let
      // any user rewrite the record (name, art, stats) every other player sees.
      // An existing row wins; the upsert stays race-safe for concurrent first
      // adds of the same bggId. Refreshing stale BGG data belongs to the
      // server-side enrich path, which fetches from BGG itself.
      const game = await prisma.games.upsert({
        where: { bggId: bggId ?? -1 },
        update: {},
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
