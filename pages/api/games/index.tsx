import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const {
    q = "",
    players,
    minTime,
    maxTime,
    complexity,
    minComplexity,
    sortBy = "name",
    sortDir = "asc",
    page = "0",
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page);
  const PAGE_SIZE = 48;

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(players
      ? { minPlayers: { lte: parseInt(players) }, maxPlayers: { gte: parseInt(players) } }
      : {}),
    ...(minTime ? { minPlaytime: { gte: parseInt(minTime) } } : {}),
    ...(maxTime ? { maxPlaytime: { lte: parseInt(maxTime) } } : {}),
    ...(complexity ? { complexity: { lte: parseFloat(complexity) } } : {}),
    ...(minComplexity ? { complexity: { gte: parseFloat(minComplexity) } } : {}),
  };

  const orderBy: any =
    sortBy === "bggRating"
      ? { bggRating: sortDir }
      : sortBy === "complexity"
        ? { complexity: sortDir }
        : sortBy === "minPlaytime"
          ? { minPlaytime: sortDir }
          : sortBy === "yearPublished"
            ? { yearPublished: sortDir }
            : sortBy === "minPlayers"
              ? { minPlayers: sortDir }
              : { name: sortDir };

  const [dbGames, total] = await Promise.all([
    prisma.games.findMany({
      where,
      orderBy,
      take: PAGE_SIZE,
      skip: pageNum * PAGE_SIZE,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        bggId: true,
        minPlayers: true,
        maxPlayers: true,
        minPlaytime: true,
        maxPlaytime: true,
        complexity: true,
        bggRating: true,
        categories: true,
        yearPublished: true,
      },
    }),
    prisma.games.count({ where }),
  ]);

  const games = dbGames.map((g) => ({
    gameId: g.id,
    name: g.name,
    imageUrl: g.imageUrl,
    bggId: g.bggId,
    minPlayers: g.minPlayers,
    maxPlayers: g.maxPlayers,
    minPlaytime: g.minPlaytime,
    maxPlaytime: g.maxPlaytime,
    complexity: g.complexity,
    bggRating: g.bggRating,
    categories: g.categories,
    yearPublished: g.yearPublished,
  }));

  return res.status(200).json({ games, total, page: pageNum, pageSize: PAGE_SIZE });
}
