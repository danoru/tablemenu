import { XMLParser } from "fast-xml-parser";
import type { NextApiRequest, NextApiResponse } from "next";

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

// BGG returns 202 when the collection is being prepared — retry up to 5 times
async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  maxRetries = 5
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url, { headers });
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

  const headers = {
    Authorization: `Bearer ${process.env.BGG_API_TOKEN}`,
    Accept: "application/xml",
  };

  try {
    // own=1 — only owned games
    // excludesubtype=boardgameexpansion — no expansions
    // stats=1 — includes ratings and weight
    const url = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username.trim())}&own=1&excludesubtype=boardgameexpansion&stats=1`;

    let bggRes: Response;
    try {
      bggRes = await fetchWithRetry(url, headers);
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

    const xml = await bggRes.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);

    // BGG returns an error message in XML when username not found
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
          // Collection endpoint doesn't include categories/mechanics/designers
          // These will be populated via individual game fetches on bulkAdd
          categories: [],
          mechanics: [],
          designers: [],
          publishers: [],
          countries: [],
        };
      });

    res.setHeader("Cache-Control", "private, max-age=300"); // 5 min cache
    return res.status(200).json({ games });
  } catch (err) {
    console.error("[bgg/collection]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
