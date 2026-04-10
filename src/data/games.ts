import prisma from "./db";

export async function getGameById(id: number) {
  return prisma.games.findUnique({ where: { id } });
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
    userStars: ratingMap.get(ug.gameId) ?? null,
  }));
}
