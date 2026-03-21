import { XMLParser } from "fast-xml-parser";
import type { NextApiRequest, NextApiResponse } from "next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BggGameDetail {
  bggId: number;
  name: string;
  yearPublished: number | null;
  description: string;
  imageUrl: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  complexity: number | null;
  bggRating: number | null;
  categories: string[];
}

interface ApiResponse {
  game?: BggGameDetail;
  error?: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bggId } = req.query;

  if (!bggId || typeof bggId !== "string" || isNaN(Number(bggId))) {
    return res.status(400).json({ error: "Invalid BGG ID" });
  }

  try {
    const bggRes = await fetch(`https://boardgamegeek.com/xmlapi/boardgame/${bggId}?stats=1`, {
      headers: { "User-Agent": "Tablekeeper/1.0" },
    });

    if (!bggRes.ok) {
      return res.status(502).json({ error: "BGG API unavailable" });
    }

    const xml = await bggRes.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);

    const item = parsed?.items?.item;

    if (!item) {
      return res.status(404).json({ error: "Game not found" });
    }

    // ── Name ──────────────────────────────────────────────────────────────────
    const nameList = Array.isArray(item.name) ? item.name : [item.name];
    const primary = nameList.find((n: any) => n["@_type"] === "primary") ?? nameList[0];
    const name = primary?.["@_value"] ?? "Unknown";

    // ── Description ───────────────────────────────────────────────────────────
    const rawDesc: string = item.description ?? "";
    const description = rawDesc
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#10;/g, " ")
      .trim();

    // ── Categories ────────────────────────────────────────────────────────────
    const links = Array.isArray(item.link) ? item.link : item.link ? [item.link] : [];
    const categories: string[] = links
      .filter((l: any) => l["@_type"] === "boardgamecategory")
      .map((l: any) => l["@_value"] as string);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const ratings = item.statistics?.ratings;
    const bggRating = ratings?.average?.["@_value"]
      ? parseFloat(Number(ratings.average["@_value"]).toFixed(2))
      : null;
    const complexity = ratings?.averageweight?.["@_value"]
      ? parseFloat(Number(ratings.averageweight["@_value"]).toFixed(2))
      : null;

    const game: BggGameDetail = {
      bggId: Number(item["@_id"]),
      name,
      description,
      imageUrl: item.image ?? "",
      yearPublished: item.yearpublished?.["@_value"] ? Number(item.yearpublished["@_value"]) : null,
      minPlayers: Number(item.minplayers?.["@_value"] ?? 1),
      maxPlayers: Number(item.maxplayers?.["@_value"] ?? 1),
      minPlaytime: Number(item.minplaytime?.["@_value"] ?? 0),
      maxPlaytime: Number(item.maxplaytime?.["@_value"] ?? 0),
      complexity,
      bggRating,
      categories,
    };

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).json({ game });
  } catch (err) {
    console.error("[bgg/[bggId]]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
