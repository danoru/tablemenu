import type { Prisma } from "@prisma/client";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";

const PAGE_SIZE = 48;

/** Sort keys the client may ask for, and whether the column is nullable. */
const SORTABLE = {
  name: { nullable: false },
  bggRating: { nullable: true },
  complexity: { nullable: true },
  minPlaytime: { nullable: false },
  yearPublished: { nullable: true },
  minPlayers: { nullable: false },
} as const;

type SortKey = keyof typeof SORTABLE;

function isSortKey(v: string): v is SortKey {
  return Object.prototype.hasOwnProperty.call(SORTABLE, v);
}

/** parseInt that yields undefined for anything that isn't a finite number. */
function intOrUndefined(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

function floatOrUndefined(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

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

  // Every one of these is attacker- or typo-reachable from the query string.
  // Unparseable numbers become "filter absent" rather than NaN, which Prisma
  // rejects at the driver with a 500.
  const pageNum = Math.max(0, intOrUndefined(page) ?? 0);
  const playerCount = intOrUndefined(players);
  const minPlaytime = intOrUndefined(minTime);
  const maxPlaytime = intOrUndefined(maxTime);
  const maxComplexity = floatOrUndefined(complexity);
  const minComplexityNum = floatOrUndefined(minComplexity);

  // Min and max complexity are one range on one column. Spreading them as two
  // `complexity` keys meant the second silently clobbered the first, so the
  // Max chip did nothing whenever a Min chip was also active.
  const complexityRange = {
    ...(minComplexityNum !== undefined && { gte: minComplexityNum }),
    ...(maxComplexity !== undefined && { lte: maxComplexity }),
  };

  const where: Prisma.GamesWhereInput = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(playerCount !== undefined
      ? { minPlayers: { lte: playerCount }, maxPlayers: { gte: playerCount } }
      : {}),
    ...(minPlaytime !== undefined ? { minPlaytime: { gte: minPlaytime } } : {}),
    ...(maxPlaytime !== undefined ? { maxPlaytime: { lte: maxPlaytime } } : {}),
    ...(Object.keys(complexityRange).length > 0 ? { complexity: complexityRange } : {}),
  };

  const sortKey: SortKey = isSortKey(sortBy) ? sortBy : "name";
  const dir: "asc" | "desc" = sortDir === "desc" ? "desc" : "asc";
  // Postgres orders NULLs last on ASC and first on DESC, so "highest rated"
  // used to lead with every unrated game. Push them to the back either way.
  const orderBy: Prisma.GamesOrderByWithRelationInput = SORTABLE[sortKey].nullable
    ? { [sortKey]: { sort: dir, nulls: "last" } }
    : { [sortKey]: dir };

  try {
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
  } catch (err) {
    console.error("[games/index]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
