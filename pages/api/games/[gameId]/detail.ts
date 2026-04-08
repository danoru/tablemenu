import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session ? (session.user as any).id : null;
  const gameId = parseInt((req.query.gameId as string) ?? (req.query.gameId as string));

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
}
