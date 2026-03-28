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
    page = "0",
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page);
  const PAGE_SIZE = 48;

  const games = await prisma.games.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(players
        ? { minPlayers: { lte: parseInt(players) }, maxPlayers: { gte: parseInt(players) } }
        : {}),
      ...(minTime ? { minPlaytime: { gte: parseInt(minTime) } } : {}),
      ...(maxTime ? { maxPlaytime: { lte: parseInt(maxTime) } } : {}),
      ...(complexity ? { complexity: { lte: parseFloat(complexity) } } : {}),
    },
    orderBy: { bggRating: "desc" },
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
  });

  const total = await prisma.games.count({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
  });

  return res.status(200).json({ games, total, page: pageNum, pageSize: PAGE_SIZE });
}
