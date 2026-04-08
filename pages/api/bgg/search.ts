import { XMLParser } from "fast-xml-parser";
import type { NextApiRequest, NextApiResponse } from "next";

export interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished: number | null;
}

interface ApiResponse {
  results?: BggSearchResult[];
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q, exact } = req.query;

  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return res.status(400).json({ error: "Query must be at least 2 characters" });
  }

  try {
    const bggUrl = new URLSearchParams({
      query: q.trim(),
      type: "boardgame",
      excludesubtype: "boardgameexpansion",
    });
    if (exact === "1") bggUrl.set("exact", "1");

    const bggRes = await fetch(`https://boardgamegeek.com/xmlapi2/search?${bggUrl.toString()}`, {
      headers: {
        Authorization: `Bearer ${process.env.BGG_API_TOKEN}`,
        Accept: "application/xml",
      },
    });

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

    const itemArray = (Array.isArray(items) ? items : [items]).filter(
      (item: any) => item["@_type"] !== "boardgameexpansion"
    );

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

    results.sort((a, b) => {
      const q_lower = q.trim().toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const rank = (name: string) => {
        if (name === q_lower) return 0;
        if (name.startsWith(q_lower)) return 1;
        if (name.includes(q_lower)) return 2;
        return 3;
      };

      return rank(aName) - rank(bName) || aName.localeCompare(bName);
    });

    return res.status(200).json({ results: results });
  } catch (err) {
    console.error("[bgg/search]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
