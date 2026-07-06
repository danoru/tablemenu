import { authOptions } from "@/lib/authOptions";
import { bggFetch, parseBggXml } from "@/lib/bgg/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

export interface BGGCollectionGame {
  bggId: number;
  name: string;
  yearPublished: number | null;
  imageUrl: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  complexity: number | null;
  bggRating: number | null;
  categories: string[];
  mechanics: string[];
  designers: string[];
  publishers: string[];
  countries: string[];
}

interface ApiResponse {
  games?: BGGCollectionGame[];
  error?: string;
  retrying?: boolean;
}

async function fetchWithRetry(url: string, maxRetries = 5): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const res = await bggFetch(url);
    if (res.status !== 202) return res;
    await new Promise((r) => setTimeout(r, 2000 + i * 1000));
  }
  throw new Error("BGG collection not ready after retries");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { username } = req.query;
  if (!username || typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "BGG username is required" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const url = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username.trim())}&own=1&excludesubtype=boardgameexpansion&stats=1`;

    let bggRes: Response;
    try {
      bggRes = await fetchWithRetry(url);
    } catch {
      return res.status(202).json({
        error: "BGG is preparing the collection. Please try again in a moment.",
        retrying: true,
      });
    }

    if (bggRes.status === 404 || bggRes.status === 400) {
      return res
        .status(404)
        .json({ error: `BGG user "${username}" not found or collection is private.` });
    }

    if (!bggRes.ok) {
      return res.status(502).json({ error: "BGG API unavailable" });
    }

    const parsed = parseBggXml(await bggRes.text());

    if (parsed?.errors?.error) {
      return res
        .status(404)
        .json({ error: `BGG user "${username}" not found or collection is private.` });
    }

    const items = parsed?.items?.item;
    if (!items) return res.status(200).json({ games: [] });

    const itemArray = Array.isArray(items) ? items : [items];

    const games: BGGCollectionGame[] = itemArray
      .filter((item: any) => item["@_subtype"] === "boardgame")
      .map((item: any) => {
        const name = item.name?.["@_sortindex"]
          ? (item.name?.["#text"] ?? item.name?.["@_value"] ?? "Unknown")
          : (item.name?.["@_value"] ?? item.name ?? "Unknown");

        const stats = item.stats;
        const ratings = stats?.rating;

        const bggRating = ratings?.average?.["@_value"]
          ? parseFloat(Number(ratings.average["@_value"]).toFixed(2))
          : null;
        const complexity = ratings?.averageweight?.["@_value"]
          ? parseFloat(Number(ratings.averageweight["@_value"]).toFixed(2))
          : null;

        return {
          bggId: Number(item["@_objectid"]),
          name: typeof name === "string" ? name : "Unknown",
          yearPublished: item.yearpublished ? Number(item.yearpublished) : null,
          imageUrl: item.image ?? "",
          minPlayers: Number(stats?.["@_minplayers"] ?? 1),
          maxPlayers: Number(stats?.["@_maxplayers"] ?? 1),
          minPlaytime: Number(stats?.["@_minplaytime"] ?? 0),
          maxPlaytime: Number(stats?.["@_maxplaytime"] ?? 0),
          complexity,
          bggRating,
          categories: [],
          mechanics: [],
          designers: [],
          publishers: [],
          countries: [],
        };
      });

    res.setHeader("Cache-Control", "private, max-age=300");
    return res.status(200).json({ games });
  } catch (err) {
    console.error("[bgg/collection]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
