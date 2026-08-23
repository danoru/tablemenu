import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const userId = (session.user as any).id as number;
  const gameId = parseInt(req.query.gameId as string);

  if (isNaN(gameId)) return res.status(400).json({ error: "Invalid gameId" });

  try {
    const existing = await prisma.userGames.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Game not in library" });
    }

    await prisma.userGames.delete({
      where: { userId_gameId: { userId, gameId } },
    });

    return res.status(200).json({ gameId, removed: true });
  } catch (err) {
    console.error("[games/library:delete]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
