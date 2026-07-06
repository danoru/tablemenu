import type { LibraryGame } from "@pages/api/games/library";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  nbsp: " ",
};

/** Strip HTML tags and decode the entities BGG descriptions carry. */
export function decodeHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate to ~maxLen characters at a word boundary, adding an ellipsis. */
function truncateWords(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s,.;:—–-]+$/, "") + "…";
}

/**
 * A menu "tasting note": the first sentence of the game's description, cleaned
 * and trimmed. Falls back to a template woven from category/designer/year.
 * Returns null when there's nothing to say.
 */
export function tastingNote(game: LibraryGame, maxLen = 140): string | null {
  const desc = game.description ? decodeHtml(game.description) : "";
  if (desc) {
    const firstSentence = desc.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? desc;
    return truncateWords(firstSentence.trim(), maxLen);
  }

  const category = game.categories?.[0];
  const designer = game.designers?.[0];
  const year = game.yearPublished;
  if (category && designer && year) return `A ${category} affair from ${designer}, ${year}.`;
  if (category && designer) return `A ${category} affair from ${designer}.`;
  if (category && year) return `A ${category} affair from ${year}.`;
  if (category) return `A ${category} affair.`;
  return null;
}

/** Build the tastingNotes map the PDF expects, keyed by String(gameId). */
export function buildTastingNotes(games: LibraryGame[]): Record<string, string> {
  const notes: Record<string, string> = {};
  for (const g of games) {
    const note = tastingNote(g);
    if (note) notes[String(g.gameId)] = note;
  }
  return notes;
}

/** Complexity as a 1–5 spice level; 0 when unknown (render nothing). */
export function spiceLevel(game: LibraryGame): number {
  if (game.complexity == null) return 0;
  return Math.min(5, Math.max(1, Math.round(game.complexity)));
}

/** Playtime shown as the menu "price" — never money. */
export function priceLabel(game: LibraryGame): string {
  const { minPlaytime: min, maxPlaytime: max } = game;
  if (min && max && min !== max) return `${min}–${max} min`;
  const t = max || min;
  return t ? `${t} min` : "";
}

export function playersLabel(game: LibraryGame): string {
  const { minPlayers: min, maxPlayers: max } = game;
  if (min && max && min !== max) return `${min}–${max}p`;
  const p = max || min;
  return p ? `${p}p` : "";
}

/** A rating badge string, preferring the user's own stars over BGG's average. */
export function ratingLabel(game: LibraryGame): string | null {
  if (game.userStars != null) return `★ ${game.userStars}/5`;
  if (game.bggRating != null) return `★ ${game.bggRating.toFixed(1)}`;
  return null;
}
