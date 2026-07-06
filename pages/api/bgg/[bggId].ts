import { authOptions } from "@/lib/authOptions";
import { fetchThings } from "@/lib/bgg/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

export type { BggGameDetail } from "@/lib/bgg/client";
import type { BggGameDetail } from "@/lib/bgg/client";

interface ApiResponse {
  game?: BggGameDetail;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { bggId } = req.query;
  if (!bggId || typeof bggId !== "string" || isNaN(Number(bggId)))
    return res.status(400).json({ error: "Invalid BGG ID" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const [game] = await fetchThings([Number(bggId)]);
    if (!game) return res.status(404).json({ error: "Game not found" });

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).json({ game });
  } catch (err) {
    console.error("[bgg/[bggId]]", err);
    return res.status(502).json({ error: "BGG API unavailable" });
  }
}
