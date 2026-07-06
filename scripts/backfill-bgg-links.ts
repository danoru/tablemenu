/**
 * One-off backfill for BGG link data (mechanics / categories / designers /
 * publishers / countries) on the shared `Games` table.
 *
 * Bulk imports via `/api/bgg/collection` cannot return link arrays (BGG API
 * limitation), so bulk-imported libraries have empty mechanics/categories.
 * This walks every un-synced game, fetches full `thing` details in batches,
 * and fills in the missing arrays. Idempotent: `bggLastSynced` is the
 * checkpoint, so re-running skips rows already done.
 *
 * Run:
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/backfill-bgg-links.ts
 * (or `pnpm backfill:bgg`). Needs POSTGRES_PRISMA_URL + BGG_API_TOKEN in env.
 */
import { PrismaClient } from "@prisma/client";

import { MAX_THING_BATCH, fetchThings } from "../src/lib/bgg/client";

const prisma = new PrismaClient();

const SLEEP_BETWEEN_MS = 2_500;
const BACKOFF_MS = [5_000, 10_000, 20_000];
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const games = await prisma.games.findMany({
    where: {
      OR: [{ mechanics: { isEmpty: true } }, { bggLastSynced: null }],
      bggId: { not: null },
    },
    orderBy: { bggId: "asc" },
    select: { id: true, bggId: true, name: true, yearPublished: true },
  });

  const chunks = chunk(games, MAX_THING_BATCH);
  console.log(`[backfill] ${games.length} games in ${chunks.length} chunks of ${MAX_THING_BATCH}`);

  let updated = 0;

  for (let c = 0; c < chunks.length; c++) {
    const chunkGames = chunks[c];
    const bggIds = chunkGames.map((g) => g.bggId!).filter((id) => id != null);

    let details = null as Awaited<ReturnType<typeof fetchThings>> | null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        details = await fetchThings(bggIds);
        break;
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.warn(
            `[backfill] chunk ${c + 1}/${chunks.length} failed after ${MAX_RETRIES} retries, skipping:`,
            err instanceof Error ? err.message : err
          );
          details = null;
          break;
        }
        const wait = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
        console.warn(
          `[backfill] chunk ${c + 1}/${chunks.length} attempt ${attempt + 1} failed, backing off ${wait}ms`
        );
        await sleep(wait);
      }
    }

    if (details) {
      const byBggId = new Map(details.map((d) => [d.bggId, d]));
      for (const g of chunkGames) {
        const d = g.bggId != null ? byBggId.get(g.bggId) : undefined;
        if (!d) continue;
        await prisma.games.update({
          where: { bggId: g.bggId! },
          data: {
            mechanics: d.mechanics,
            categories: d.categories,
            designers: d.designers,
            publishers: d.publishers,
            countries: d.countries,
            // Only fill yearPublished if we don't already have one — the owner
            // may have curated it. Same policy for other pre-populated fields:
            // name/players/playtimes/complexity/bggRating are left untouched.
            ...(g.yearPublished == null && d.yearPublished != null
              ? { yearPublished: d.yearPublished }
              : {}),
            bggLastSynced: new Date(),
          },
        });
        updated++;
      }
    }

    console.log(`[backfill] ${c + 1}/${chunks.length} chunks, ${updated} games updated`);

    if (c < chunks.length - 1) await sleep(SLEEP_BETWEEN_MS);
  }

  console.log(`[backfill] done — ${updated} games updated`);
}

main()
  .catch((err) => {
    console.error("[backfill] fatal:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
