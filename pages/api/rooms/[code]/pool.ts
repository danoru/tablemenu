import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { LibraryGame } from "@api/games/library";

interface ApiResponse {
  pool?: LibraryGame[];
  roomName?: string;
  error?: string;
}

/**
 * The room's game pool as full LibraryGame records — everything the menu
 * generator needs (categories, mechanics, complexity, description, the
 * viewer's own rating/favourite).
 *
 * Deliberately separate from the room GET: that endpoint is polled every five
 * seconds by every open room page, and these fields would bloat it. This one
 * is fetched once, when someone connects the menu to a room.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid room code" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });
  const userId = Number((session.user as any).id);

  try {
    const room = await prisma.rooms.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        name: true,
        invites: { select: { userId: true, status: true } },
        gameSuggs: { select: { game: true } },
      },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });

    // Same membership gate as the room GET — the pool is member data.
    const isMember = room.invites.some((inv) => inv.userId === userId && inv.status === "ACCEPTED");
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this room" });
    }

    const gameIds = room.gameSuggs.map((s) => s.game.id);

    // The viewer's own relationship to these games, so Desserts (favourites /
    // 4★+) and the rating badges work on a room menu the same as a solo one.
    const [userGames, ratings] = await Promise.all([
      prisma.userGames.findMany({
        where: { userId, gameId: { in: gameIds } },
        select: {
          id: true,
          gameId: true,
          addedAt: true,
          weight: true,
          notes: true,
          isFavorite: true,
          isWishlist: true,
        },
      }),
      prisma.userGameRatings.findMany({
        where: { userId, gameId: { in: gameIds } },
        select: { gameId: true, stars: true },
      }),
    ]);
    const ownMap = new Map(userGames.map((ug) => [ug.gameId, ug]));
    const ratingMap = new Map(ratings.map((r) => [r.gameId, r.stars]));

    const pool: LibraryGame[] = room.gameSuggs.map(({ game }) => {
      const own = ownMap.get(game.id);
      return {
        userGameId: own?.id ?? game.id,
        gameId: game.id,
        addedAt: (own?.addedAt ?? new Date()).toISOString(),
        weight: own?.weight ?? 1,
        notes: own?.notes ?? null,
        bggId: game.bggId,
        name: game.name,
        description: game.description,
        imageUrl: game.imageUrl,
        isFavorite: own?.isFavorite ?? false,
        isWishlist: own?.isWishlist ?? false,
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
        yearPublished: game.yearPublished,
        userStars: ratingMap.get(game.id) ?? null,
      };
    });

    return res.status(200).json({ pool, roomName: room.name });
  } catch (err) {
    console.error("[rooms/[code]/pool]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
