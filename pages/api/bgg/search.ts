import { XMLParser } from "fast-xml-parser";
import type { NextApiRequest, NextApiResponse } from "next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished: number | null;
}

interface ApiResponse {
  results?: BggSearchResult[];
  error?: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;

  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return res.status(400).json({ error: "Query must be at least 2 characters" });
  }

  try {
    const bggRes = await fetch(
      `https://boardgamegeek.com/xmlapi/search?search=${encodeURIComponent(q.trim())}&exact=0`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      }
    );

    console.log("BGG status:", bggRes.status);
    console.log("BGG ok:", bggRes.ok);

    if (!bggRes.ok) {
      return res.status(502).json({ error: "BGG API unavailable" });
    }

    const xml = await bggRes.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);

    const items = parsed?.items?.item;

    if (!items) {
      return res.status(200).json({ results: [] });
    }

    const itemArray = Array.isArray(items) ? items : [items];

    const results: BggSearchResult[] = itemArray.map((item: any) => {
      const nameList = Array.isArray(item.name) ? item.name : [item.name];
      const primary = nameList.find((n: any) => n["@_type"] === "primary") ?? nameList[0];

      return {
        bggId: Number(item["@_id"]),
        name: primary?.["@_value"] ?? "Unknown",
        yearPublished: item.yearpublished?.["@_value"]
          ? Number(item.yearpublished["@_value"])
          : null,
      };
    });

    results.sort((a, b) => (b.yearPublished ?? 0) - (a.yearPublished ?? 0));

    return res.status(200).json({ results: results.slice(0, 20) });
  } catch (err) {
    console.error("[bgg/search]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
