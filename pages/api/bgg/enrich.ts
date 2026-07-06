import { authOptions } from "@/lib/authOptions";
import { MAX_THING_BATCH, fetchThings } from "@/lib/bgg/client";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

interface ApiResponse {
  enriched?: number;
  error?: string;
}

/**
 * Fill in BGG link data (mechanics/categories/designers/publishers/countries)
 * for `Games` rows that were bulk-imported without it. Only touches rows whose
 * `mechanics` is currently empty — never overwrites curated/populated arrays.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Not authenticated" });

  const { bggIds } = req.body as { bggIds?: unknown };
  if (!Array.isArray(bggIds) || bggIds.length === 0) {
    return res.status(400).json({ error: "bggIds must be a non-empty array" });
  }
  if (bggIds.length > MAX_THING_BATCH) {
    return res.status(400).json({ error: `At most ${MAX_THING_BATCH} ids per call` });
  }

  const ids = bggIds.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);
  if (ids.length === 0) return res.status(400).json({ error: "No valid bggIds" });

  try {
    const details = await fetchThings(ids);
    let enriched = 0;

    for (const d of details) {
      const result = await prisma.games.updateMany({
        where: { bggId: d.bggId, mechanics: { isEmpty: true } },
        data: {
          mechanics: d.mechanics,
          categories: d.categories,
          designers: d.designers,
          publishers: d.publishers,
          countries: d.countries,
          bggLastSynced: new Date(),
        },
      });
      enriched += result.count;
    }

    return res.status(200).json({ enriched });
  } catch (err) {
    console.error("[bgg/enrich]", err);
    return res.status(502).json({ error: "BGG enrichment failed" });
  }
}
