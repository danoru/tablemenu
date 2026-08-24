import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const gameId = parseInt(req.query.gameId as string);
  if (isNaN(gameId)) {
    return res.status(400).json({ error: "Invalid game id" });
  }

  const session = await getServerSession(req, res, authOptions);
  // authorize() returns id as a string, so this has to be converted before it
  // reaches Prisma — an unconverted value fails with "Argument `userId`:
  // Invalid value provided. Expected Int, provided String", which the catch
  // below turns into a 500. Same fix as b7b3ea7 applied to the four sibling
  // routes; this one was missed.
  const userId = session ? Number((session.user as any).id) : null;

  try {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      include: {
        users: userId
          ? {
              where: { userId },
              select: { notes: true, weight: true, isWishlist: true, isFavorite: true },
            }
          : false,
        ratings: userId ? { where: { userId }, select: { stars: true, review: true } } : false,
      },
    });

    if (!game) return res.status(404).json({ error: "Not found" });

    const sessions = userId
      ? await prisma.gameSessionGames.findMany({
          where: { gameId },
          include: {
            gameSession: {
              include: { players: { where: { userId } } },
            },
          },
        })
      : [];

    return res.status(200).json({ game, sessions });
  } catch (err) {
    console.error("[games/[gameId]/detail]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
