import type { GameForCompat } from "@/services/compatibility";

import prisma from "./db";

export async function getGameById(id: number) {
  return prisma.games.findUnique({ where: { id } });
}

/** `addedAt` rides along so profile previews can sort without a second scan. */
export type TasteGame = GameForCompat & { addedAt: string };

export async function getUserGamesForTaste(userId: number): Promise<TasteGame[]> {
  const userGames = await prisma.userGames.findMany({
    where: { userId, isWishlist: false },
    select: {
      gameId: true,
      addedAt: true,
      isFavorite: true,
      game: {
        select: {
          name: true,
          imageUrl: true,
          complexity: true,
          minPlaytime: true,
          maxPlaytime: true,
          minPlayers: true,
          maxPlayers: true,
          yearPublished: true,
          categories: true,
          mechanics: true,
        },
      },
    },
  });
  const ratings = await prisma.userGameRatings.findMany({
    where: { userId },
    select: { gameId: true, stars: true },
  });
  const ratingMap = new Map(ratings.map((r) => [r.gameId, r.stars]));
  return userGames.map((ug) => ({
    gameId: ug.gameId,
    addedAt: ug.addedAt.toISOString(),
    name: ug.game.name,
    imageUrl: ug.game.imageUrl,
    complexity: ug.game.complexity,
    minPlaytime: ug.game.minPlaytime,
    maxPlaytime: ug.game.maxPlaytime,
    minPlayers: ug.game.minPlayers,
    maxPlayers: ug.game.maxPlayers,
    yearPublished: ug.game.yearPublished,
    categories: ug.game.categories,
    mechanics: ug.game.mechanics,
    isFavorite: ug.isFavorite,
    userStars: ratingMap.get(ug.gameId) ?? null,
  }));
}

/** Just enough of a game to render a card or a name row. */
export interface SlimGame {
  gameId: number;
  name: string;
  imageUrl: string | null;
}

/**
 * The owned library as SlimGame rows, name order. For surfaces that only
 * render names/art (room "Add from my library", pickers) — the full
 * getUserLibrary payload is an order of magnitude heavier and ends up
 * serialized into the page's SSR props.
 */
export async function getOwnedGamesSlim(userId: number): Promise<SlimGame[]> {
  const rows = await prisma.userGames.findMany({
    where: { userId, isWishlist: false },
    orderBy: { game: { name: "asc" } },
    select: { game: { select: { id: true, name: true, imageUrl: true } } },
  });
  return rows.map((r) => ({ gameId: r.game.id, name: r.game.name, imageUrl: r.game.imageUrl }));
}

/**
 * Wishlist rows, newest first. Kept separate from getUserLibrary, which
 * deliberately excludes wishlist entries — profile "Want to Play" reads this.
 */
export async function getWishlistSlim(userId: number): Promise<SlimGame[]> {
  const rows = await prisma.userGames.findMany({
    where: { userId, isWishlist: true },
    orderBy: { addedAt: "desc" },
    select: { game: { select: { id: true, name: true, imageUrl: true } } },
  });
  return rows.map((r) => ({ gameId: r.game.id, name: r.game.name, imageUrl: r.game.imageUrl }));
}

export async function getGameByName(name: string) {
  return prisma.games.findFirst({ where: { name } });
}

export async function getUserLibrary(userId: number) {
  const userGames = await prisma.userGames.findMany({
    include: { game: true },
    orderBy: {
      game: {
        name: "asc",
      },
    },
    where: { userId, isWishlist: false },
  });

  const ratings = await prisma.userGameRatings.findMany({
    select: { gameId: true, stars: true },
    where: { userId },
  });

  const ratingMap = new Map(ratings.map((r) => [r.gameId, r.stars]));

  return userGames.map((ug) => ({
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
    mechanics: ug.game.mechanics,
    designers: ug.game.designers,
    publishers: ug.game.publishers,
    yearPublished: ug.game.yearPublished,
    userStars: ratingMap.get(ug.gameId) ?? null,
  }));
}
