import type { MenuSelection, SectionConfig } from "./types";

export const SPECIAL_ID = "todays-special";

/** The shared print/web arrangement: two course columns + a full-width feature. */
export interface MenuLayout {
  left: SectionConfig[];
  right: SectionConfig[];
  special: SectionConfig | null;
}

const LEFT_IDS: ReadonlySet<string> = new Set(["aperitifs", "chefs-table"]);
const RIGHT_IDS: ReadonlySet<string> = new Set(["mains", "desserts"]);

/**
 * Split sections into the two-column programme layout used by both the web
 * menu and the PDF. Apéritifs/Chef's Table stack left, Mains/Desserts right —
 * a Z-scan of the sheet still reads in course order — and Today's Special is
 * pulled out as a full-width feature. Unknown sections fall to whichever
 * column currently holds fewer games so the sheet stays balanced.
 */
export function splitSections(
  sections: readonly SectionConfig[],
  selection: MenuSelection
): MenuLayout {
  const left: SectionConfig[] = [];
  const right: SectionConfig[] = [];
  let special: SectionConfig | null = null;

  const gamesIn = (col: SectionConfig[]) =>
    col.reduce((n, sec) => n + (selection[sec.id]?.length ?? 0), 0);

  for (const section of sections) {
    if (section.id === SPECIAL_ID) special = section;
    else if (LEFT_IDS.has(section.id)) left.push(section);
    else if (RIGHT_IDS.has(section.id)) right.push(section);
    else (gamesIn(left) <= gamesIn(right) ? left : right).push(section);
  }

  return { left, right, special };
}

/** Headline numbers for the masthead badges. */
export function menuStats(
  sections: readonly SectionConfig[],
  selection: MenuSelection
): { count: number; minutes: number } {
  const games = sections.flatMap((sec) => selection[sec.id] ?? []);
  const minutes = games.reduce((n, g) => n + (g.maxPlaytime || g.minPlaytime || 0), 0);
  return { count: games.length, minutes };
}

/** Zigzag polygon points for the masthead's sawtooth bottom edge (PDF Svg + web svg). */
export function sawtoothPoints(width: number, height: number, tooth = 18): string {
  const pts: string[] = ["0,0"];
  for (let x = 0; x < width; x += tooth) {
    pts.push(`${x + tooth / 2},${height}`, `${Math.min(x + tooth, width)},0`);
  }
  return pts.join(" ");
}

/** "45 min" / "3 hrs" / "4.5 hrs" — total table time for the badge. */
export function playHoursLabel(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const halves = Math.round(minutes / 30) / 2;
  return `${Number.isInteger(halves) ? halves : halves.toFixed(1)} hrs`;
}
