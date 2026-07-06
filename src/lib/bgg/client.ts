import { XMLParser } from "fast-xml-parser";

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
  countries: string[];
}

const DEFAULT_TIMEOUT_MS = 8_000;

/** Fetch from the BGG XML API with auth headers and a hard timeout. */
export async function bggFetch(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BGG_API_TOKEN}`,
        Accept: "application/xml",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function parseBggXml(xml: string): any {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  return parser.parse(xml);
}

export function decodeBggDescription(raw: string): string {
  return (raw ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#10;/g, " ")
    .trim();
}

export function extractCountries(links: any[]): string[] {
  const results: string[] = [];
  for (const link of links) {
    if (link["@_type"] !== "boardgamefamily") continue;
    const val: string = link["@_value"] ?? "";
    if (val.startsWith("Country: ")) results.push(val.replace("Country: ", "").trim());
    else if (val.startsWith("Region: ")) results.push(val.replace("Region: ", "").trim());
  }
  return [...new Set(results)];
}

/** Parse one `<item>` from a `thing?stats=1` response into a game detail. */
export function parseThingItem(item: any): BggGameDetail {
  const nameList = Array.isArray(item.name) ? item.name : [item.name];
  const primary = nameList.find((n: any) => n["@_type"] === "primary") ?? nameList[0];

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

  return {
    bggId: Number(item["@_id"]),
    name: primary?.["@_value"] ?? "Unknown",
    description: decodeBggDescription(item.description),
    imageUrl: item.image ?? "",
    yearPublished: item.yearpublished?.["@_value"] ? Number(item.yearpublished["@_value"]) : null,
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
  };
}

export const MAX_THING_BATCH = 20;

/**
 * Fetch full details for up to MAX_THING_BATCH games in one `thing` call
 * (the endpoint accepts comma-separated ids). Returns whatever BGG knows —
 * ids it doesn't recognize are simply absent from the result.
 */
export async function fetchThings(bggIds: number[], timeoutMs?: number): Promise<BggGameDetail[]> {
  if (bggIds.length === 0) return [];
  if (bggIds.length > MAX_THING_BATCH) {
    throw new Error(`fetchThings: at most ${MAX_THING_BATCH} ids per call (got ${bggIds.length})`);
  }

  const res = await bggFetch(
    `https://boardgamegeek.com/xmlapi2/thing?id=${bggIds.join(",")}&type=boardgame&stats=1`,
    timeoutMs
  );
  if (!res.ok) throw new Error(`BGG thing request failed with status ${res.status}`);

  const parsed = parseBggXml(await res.text());
  const items = parsed?.items?.item;
  if (!items) return [];

  return (Array.isArray(items) ? items : [items]).map(parseThingItem);
}
