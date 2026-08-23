// Render the real MenuPdfDocument to a PDF buffer and count pages, exercising
// the small / medium / max-density cases. Fonts are re-pointed at the on-disk
// .ttf files (the component registers them by browser URL).
import { resolve as pathResolve } from "node:path";
import { writeFileSync } from "node:fs";

import { Font, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

import { generateMenu } from "@/lib/menu/generate";
import { buildTastingNotes } from "@/lib/menu/format";
import type { LibraryGame } from "@pages/api/games/library";

const FONT_DIR = pathResolve(process.cwd(), "public/fonts");

// Register the on-disk .ttf files FIRST, then dynamically import the component
// (whose module-level Font.register appends the /fonts browser URLs after ours,
// so our disk entries stay first and win font resolution under Node).
Font.register({
  family: "Fraunces",
  fonts: [
    { src: `${FONT_DIR}/fraunces-700.ttf`, fontWeight: 700 },
    { src: `${FONT_DIR}/fraunces-700-italic.ttf`, fontWeight: 700, fontStyle: "italic" },
    { src: `${FONT_DIR}/fraunces-900.ttf`, fontWeight: 900 },
    { src: `${FONT_DIR}/fraunces-900-italic.ttf`, fontWeight: 900, fontStyle: "italic" },
  ],
});
Font.register({
  family: "Space Grotesk",
  fonts: [
    { src: `${FONT_DIR}/space-grotesk-400.ttf`, fontWeight: 400 },
    { src: `${FONT_DIR}/space-grotesk-500.ttf`, fontWeight: 500 },
    { src: `${FONT_DIR}/space-grotesk-700.ttf`, fontWeight: 700 },
  ],
});

const { default: MenuPdfDocument } = await import("@/components/pdf/MenuPDFDocument");

// A real square PNG data URI stands in for the /api/games/cover proxy (which
// the browser supplies) so the cover-image geometry is exercised offline.
const { default: sharp } = await import("sharp");
const coverPng = await sharp({
  create: { width: 64, height: 64, channels: 3, background: { r: 107, g: 127, b: 63 } },
})
  .png()
  .toBuffer();
const COVER_URI = `data:image/png;base64,${coverPng.toString("base64")}`;

const LONG_NAME = "The Exceedingly Grand Expedition to the Far Reaches of Catan Deluxe Edition";
const LONG_DESC =
  "In this sprawling strategy epic, players guide rival trading houses across a shifting archipelago, brokering fragile alliances and racing to control the richest ports. Every turn tightens the screws.";

function makeGame(i: number, opts: Partial<LibraryGame> = {}): LibraryGame {
  return {
    userGameId: i,
    gameId: i,
    addedAt: "",
    weight: 1,
    notes: null,
    bggId: 1000 + i,
    name: LONG_NAME,
    description: LONG_DESC,
    imageUrl: null,
    isFavorite: i % 3 === 0,
    isWishlist: false,
    minPlayers: 2,
    maxPlayers: 6,
    minPlaytime: 30,
    maxPlaytime: 60,
    complexity: 3.4,
    bggRating: 8.2,
    categories: ["Economic", "Negotiation"],
    mechanics: ["Trading", "Dice Rolling"],
    designers: ["Klaus Teuber"],
    publishers: ["Kosmos"],
    yearPublished: 1995,
    userStars: 5,
    ...opts,
  };
}

// A pool crafted so all five sections fill to the 12-game cap
// (aperitifs 3 + mains 3 + chef's 2 + desserts 2 + special 2).
function maxPool(): LibraryGame[] {
  const games: LibraryGame[] = [];
  let id = 1;
  // aperitifs (<=30), plain so they aren't eligible for desserts
  for (let k = 0; k < 4; k++)
    games.push(
      makeGame(id++, { minPlaytime: 20, maxPlaytime: 25, isFavorite: false, userStars: null })
    );
  // mains (31-90), all sharing a mechanic so Today's Special has ≥3 to draw on
  for (let k = 0; k < 8; k++)
    games.push(
      makeGame(id++, {
        minPlaytime: 45,
        maxPlaytime: 75,
        mechanics: ["Worker Placement"],
        categories: ["Strategy"],
        isFavorite: false,
        userStars: null,
      })
    );
  // chef's table (>90)
  for (let k = 0; k < 3; k++)
    games.push(makeGame(id++, { minPlaytime: 120, maxPlaytime: 180, isFavorite: false }));
  // desserts (favourite/high-rated, menuTime<=45, >30 so not aperitif-eligible)
  for (let k = 0; k < 3; k++)
    games.push(
      makeGame(id++, { minPlaytime: 35, maxPlaytime: 40, isFavorite: true, userStars: 5 })
    );
  return games;
}

function countPages(buf: Buffer): number {
  const text = buf.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page(?![s])/g);
  return matches ? matches.length : 0;
}

async function renderCase(label: string, pool: LibraryGame[], withCovers: boolean) {
  const menu = generateMenu(pool, `2026-07-06-verify-${label}`);
  const total = menu.sections.reduce((n, s) => n + (menu.selection[s.id]?.length ?? 0), 0);
  const tastingNotes = buildTastingNotes(Object.values(menu.selection).flat());
  const covers: Record<string, string> = {};
  if (withCovers) {
    for (const g of Object.values(menu.selection).flat()) covers[String(g.gameId)] = COVER_URI;
  }
  const el = React.createElement(MenuPdfDocument, {
    menu: menu.selection,
    sections: menu.sections,
    tastingNotes,
    covers,
    date: new Date("2026-07-06T12:00:00Z"),
  });
  const buf = await renderToBuffer(el as any);
  const pages = countPages(buf);
  const out = pathResolve(process.cwd(), `scripts/pdfverify/out-${label}.pdf`);
  writeFileSync(out, buf);
  console.log(
    `CASE ${label}: sections=${menu.sections.length} games=${total} pages=${pages} -> ${out}`
  );
  return pages;
}

// @react-pdf warns (doesn't throw) when a wrap=false node overflows the page.
// Treat that as a hard failure — it means content is clipped, not fitting.
let overflowed = false;
const origWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (args.some((a) => typeof a === "string" && /can't wrap between pages/.test(a))) {
    overflowed = true;
  }
  origWarn(...args);
};

async function main() {
  const small = [
    makeGame(1, { minPlaytime: 15, maxPlaytime: 25 }),
    makeGame(2, { minPlaytime: 45, maxPlaytime: 60 }),
    makeGame(3, { minPlaytime: 45, maxPlaytime: 80 }),
    makeGame(4, { minPlaytime: 120, maxPlaytime: 150 }),
    makeGame(5, { minPlaytime: 20, maxPlaytime: 30, isFavorite: true, userStars: 5 }),
  ];
  // small = sparse menu, monogram tiles (no covers); max = 12-game cap with covers
  const p1 = await renderCase("small", small, false);
  const p2 = await renderCase("max", maxPool(), true);
  const ok = p1 === 1 && p2 === 1 && !overflowed;
  if (overflowed) console.log("RESULT: CONTENT OVERFLOW (clipped) ✗");
  console.log(ok ? "RESULT: all cases 1 page, no overflow ✓" : "RESULT: FAIL ✗");
  process.exitCode = ok ? 0 : 1;
}

main().catch((e) => {
  console.error("VERIFY-ERR", e);
  process.exitCode = 1;
});
