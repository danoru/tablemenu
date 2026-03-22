import { XMLParser } from "fast-xml-parser";
import type { NextApiRequest, NextApiResponse } from "next";

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
  mechanics: string[];
  designers: string[];
  publishers: string[];
  // Extracted from boardgamefamily links — "Country: Germany" → "Germany"
  countries: string[];
}

interface ApiResponse {
  game?: BggGameDetail;
  error?: string;
}

function extractCountries(links: any[]): string[] {
  const results: string[] = [];
  for (const link of links) {
    if (link["@_type"] !== "boardgamefamily") continue;
    const val: string = link["@_value"] ?? "";
    if (val.startsWith("Country: ")) results.push(val.replace("Country: ", "").trim());
    else if (val.startsWith("Region: ")) results.push(val.replace("Region: ", "").trim());
  }
  return [...new Set(results)];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { bggId } = req.query;
  if (!bggId || typeof bggId !== "string" || isNaN(Number(bggId)))
    return res.status(400).json({ error: "Invalid BGG ID" });

  try {
    const bggRes = await fetch(
      `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&type=boardgame&stats=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BGG_API_TOKEN}`,
          Accept: "application/xml",
        },
      }
    );
    if (!bggRes.ok) return res.status(502).json({ error: "BGG API unavailable" });

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(await bggRes.text());
    const item = parsed?.items?.item;
    if (!item) return res.status(404).json({ error: "Game not found" });

    const nameList = Array.isArray(item.name) ? item.name : [item.name];
    const primary = nameList.find((n: any) => n["@_type"] === "primary") ?? nameList[0];

    const description = (item.description ?? "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#10;/g, " ")
      .trim();

    const links = Array.isArray(item.link) ? item.link : item.link ? [item.link] : [];
    const byType = (type: string): string[] =>
      links.filter((l: any) => l["@_type"] === type).map((l: any) => l["@_value"] as string);

    const ratings = item.statistics?.ratings;
    const bggRating = ratings?.average?.["@_value"]
      ? parseFloat(Number(ratings.average["@_value"]).toFixed(2))
      : null;
    const complexity = ratings?.averageweight?.["@_value"]
      ? parseFloat(Number(ratings.averageweight["@_value"]).toFixed(2))
      : null;

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).json({
      game: {
        bggId: Number(item["@_id"]),
        name: primary?.["@_value"] ?? "Unknown",
        description,
        imageUrl: item.image ?? "",
        yearPublished: item.yearpublished?.["@_value"]
          ? Number(item.yearpublished["@_value"])
          : null,
        minPlayers: Number(item.minplayers?.["@_value"] ?? 1),
        maxPlayers: Number(item.maxplayers?.["@_value"] ?? 1),
        minPlaytime: Number(item.minplaytime?.["@_value"] ?? 0),
        maxPlaytime: Number(item.maxplaytime?.["@_value"] ?? 0),
        complexity,
        bggRating,
        categories: byType("boardgamecategory"),
        mechanics: byType("boardgamemechanic"),
        designers: byType("boardgamedesigner"),
        publishers: byType("boardgamepublisher"),
        countries: extractCountries(links),
      },
    });
  } catch (err) {
    console.error("[bgg/[bggId]]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
