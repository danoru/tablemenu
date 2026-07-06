import type { LibraryGame } from "@pages/api/games/library";

import type { GeneratedMenu, MenuSelection, SectionConfig, SectionId } from "./types";

// ─── Seeded RNG (mulberry32) ────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Deterministic 0..1 generator seeded from a string. */
export function makeRng(seed: string): () => number {
  let a = hashStr(seed);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── Section definitions ────────────────────────────────────────────────────

export const HARD_CAP = 12;
const THEME_MIN_OWNED = 3;

/** menuTime drives which course a game falls into. */
export function menuTime(g: LibraryGame): number {
  return g.maxPlaytime || g.minPlaytime || 0;
}

interface SectionSpec {
  base: Omit<SectionConfig, "themeTag">;
  /** Seeded target pick count (respects hard cap + eligibility). */
  target: (rng: () => number) => number;
  eligible: (g: LibraryGame) => boolean;
}

const SECTION_SPECS: Record<Exclude<SectionId, "todays-special">, SectionSpec> = {
  aperitifs: {
    base: {
      id: "aperitifs",
      icon: "🥂",
      label: "Apéritifs",
      subtitle: "Something light to open the evening",
      accent: "olive",
    },
    target: (rng) => (rng() < 0.5 ? 2 : 3),
    eligible: (g) => menuTime(g) <= 30,
  },
  mains: {
    base: {
      id: "mains",
      icon: "🍽️",
      label: "Mains",
      subtitle: "The heart of the night",
      accent: "brick",
    },
    target: () => 3,
    eligible: (g) => menuTime(g) >= 31 && menuTime(g) <= 90,
  },
  "chefs-table": {
    base: {
      id: "chefs-table",
      icon: "🏰",
      label: "Chef's Table",
      subtitle: "For those who came to commit",
      accent: "plum",
    },
    target: (rng) => (rng() < 0.5 ? 1 : 2),
    eligible: (g) => menuTime(g) > 90,
  },
  desserts: {
    base: {
      id: "desserts",
      icon: "🍮",
      label: "Desserts",
      subtitle: "House favourites to end on a high",
      accent: "mustard",
    },
    target: () => 2,
    eligible: (g) => (g.isFavorite || (g.userStars ?? 0) >= 4) && menuTime(g) <= 45,
  },
};

const SPECIAL_BASE: Omit<SectionConfig, "themeTag" | "subtitle"> = {
  id: "todays-special",
  icon: "🌟",
  label: "Today's Special",
  accent: "teal",
};

/** Order sections appear in the menu. */
const SECTION_ORDER: SectionId[] = [
  "aperitifs",
  "mains",
  "chefs-table",
  "desserts",
  "todays-special",
];

// ─── Theme selection for Today's Special ────────────────────────────────────

function tagCounts(pool: LibraryGame[], key: "mechanics" | "categories"): Map<string, number> {
  const counts = new Map<string, number>();
  for (const g of pool) {
    for (const tag of g[key] ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

/** Date-seeded theme tag; prefers mechanics, falls back to categories, else null. */
export function pickThemeTag(pool: LibraryGame[], rng: () => number): string | null {
  for (const key of ["mechanics", "categories"] as const) {
    const qualifying = [...tagCounts(pool, key).entries()]
      .filter(([, n]) => n >= THEME_MIN_OWNED)
      .map(([tag]) => tag)
      .sort();
    if (qualifying.length > 0) {
      return qualifying[Math.floor(rng() * qualifying.length)];
    }
  }
  return null;
}

function hasTag(g: LibraryGame, tag: string): boolean {
  return (g.mechanics ?? []).includes(tag) || (g.categories ?? []).includes(tag);
}

// ─── Eligibility (shared by generate + reroll) ──────────────────────────────

/** Games that could fill a section, given the (already-chosen) theme tag. */
export function eligibleForSection(pool: LibraryGame[], section: SectionConfig): LibraryGame[] {
  if (section.id === "todays-special") {
    if (!section.themeTag) return [];
    const tag = section.themeTag;
    return pool.filter((g) => hasTag(g, tag));
  }
  return pool.filter(SECTION_SPECS[section.id].eligible);
}

// ─── Generation ─────────────────────────────────────────────────────────────

export function generateMenu(pool: LibraryGame[], seed: string): GeneratedMenu {
  const rng = makeRng(seed);
  const picked = new Set<number>();
  const selection: MenuSelection = {};
  const sections: SectionConfig[] = [];
  let total = 0;

  const themeTag = pickThemeTag(pool, rng);

  for (const id of SECTION_ORDER) {
    if (total >= HARD_CAP) break;

    let config: SectionConfig;
    let eligible: LibraryGame[];
    let target: number;

    if (id === "todays-special") {
      if (!themeTag) continue; // no qualifying tag — drop the section silently
      config = {
        ...SPECIAL_BASE,
        subtitle: `Tonight we celebrate: ${themeTag}`,
        themeTag,
      };
      eligible = eligibleForSection(pool, config).filter((g) => !picked.has(g.gameId));
      target = 2;
    } else {
      const spec = SECTION_SPECS[id];
      config = { ...spec.base };
      // Desserts / mains never repeat an earlier pick.
      eligible = eligibleForSection(pool, config).filter((g) => !picked.has(g.gameId));
      target = spec.target(rng);
    }

    const room = HARD_CAP - total;
    const games = shuffle(eligible, rng).slice(0, Math.min(target, room));

    // Always show the section frame (even empty) except Today's Special, which
    // is dropped entirely when it has no theme; here it has a theme, so keep it.
    sections.push(config);
    selection[id] = games;
    for (const g of games) picked.add(g.gameId);
    total += games.length;
  }

  return { sections, selection };
}

// ─── Reroll one slot ────────────────────────────────────────────────────────

/**
 * Pick a replacement for one slot of a section, avoiding every game already on
 * the menu. Falls back to any eligible game if nothing fresh is available.
 */
export function rerollSlot(
  pool: LibraryGame[],
  section: SectionConfig,
  selection: MenuSelection,
  rng: () => number
): LibraryGame | null {
  const onMenu = new Set<number>();
  for (const games of Object.values(selection)) {
    for (const g of games) onMenu.add(g.gameId);
  }
  const eligible = eligibleForSection(pool, section);
  const fresh = eligible.filter((g) => !onMenu.has(g.gameId));
  const candidates = fresh.length > 0 ? fresh : eligible;
  if (candidates.length === 0) return null;
  return candidates[Math.floor(rng() * candidates.length)];
}
