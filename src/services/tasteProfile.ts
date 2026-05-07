export interface GameForTaste {
  gameId: number;
  complexity: number | null;
  minPlaytime: number;
  maxPlaytime: number;
  minPlayers: number;
  maxPlayers: number;
  yearPublished: number | null;
  categories: string[];
  mechanics: string[];
  isFavorite: boolean;
  userStars: number | null;
}

export type ComplexityTier = "Light" | "Medium" | "Heavy";
export type AttentionTier = "Snack" | "Quick" | "Standard" | "Marathon";
export type EraTier = "Vintage" | "Modern" | "Trendsetter";
export type RaterTier = "Generous" | "Tough crowd" | "Discerning" | "Diplomatic";

export interface TasteProfile {
  ready: boolean;
  ownedCount: number;
  ratedCount: number;
  archetype: { name: string; tagline: string };
  complexity: { tier: ComplexityTier; value: number; specialist: boolean } | null;
  attention: { tier: AttentionTier; medianMinutes: number } | null;
  sweetSpot: number | null;
  era: EraTier | null;
  rater: { tier: RaterTier; avg: number; spread: number } | null;
  coopShare: number;
  loves: string[];
  allergies: string[];
  highlights: string[];
}

const COOP_MECHANICS = ["Cooperative Game", "Solo / Solitaire Game"];
const PARTY_KEYS = ["Party Game", "Humor", "Real-Time"];
const FAMILY_KEYS = ["Family Game", "Children's Game"];
const WAR_KEYS = [
  "Wargame",
  "World War II",
  "World War I",
  "Modern Warfare",
  "American Civil War",
  "Napoleonic",
];
const FANTASY_KEYS = ["Fantasy", "Mythology", "Adventure"];
const EURO_MECHANICS = [
  "Worker Placement",
  "Engine Building",
  "Tile Placement",
  "Area Majority / Influence",
  "Auction / Bidding",
  "Drafting",
  "Card Drafting",
];

const SIGNAL_TAGS = [
  "Fantasy",
  "Party Game",
  "Wargame",
  "Horror",
  "Family Game",
  "Card Game",
  "Science Fiction",
  "Economic",
  "Adventure",
  "Mystery",
  "Worker Placement",
  "Engine Building",
  "Cooperative Game",
  "Hidden Roles",
  "Deck, Bag, and Pool Building",
  "Dice Rolling",
  "Tile Placement",
  "Area Majority / Influence",
  "Legacy Game",
];

const TAG_LABELS: Record<string, string> = {
  "Deck, Bag, and Pool Building": "Deck-builders",
  "Area Majority / Influence": "Area control",
  "Hidden Roles": "Social deduction",
  "Worker Placement": "Worker placement",
  "Engine Building": "Engine builders",
  "Cooperative Game": "Co-ops",
  "Tile Placement": "Tile-laying",
  "Dice Rolling": "Dice games",
  "Legacy Game": "Legacy games",
  "Card Game": "Card games",
  "Family Game": "Family games",
  "Party Game": "Party games",
  "Science Fiction": "Sci-fi",
};

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  return Math.sqrt(mean(nums.map((n) => (n - m) ** 2)));
}

function shareWith(
  games: GameForTaste[],
  keys: string[],
  field: "categories" | "mechanics"
): number {
  if (games.length === 0) return 0;
  const lower = keys.map((k) => k.toLowerCase());
  const hits = games.filter((g) => g[field].some((c) => lower.includes(c.toLowerCase()))).length;
  return hits / games.length;
}

function complexityTier(value: number): ComplexityTier {
  if (value < 2.0) return "Light";
  if (value < 3.0) return "Medium";
  return "Heavy";
}

function attentionTier(med: number): AttentionTier {
  if (med <= 30) return "Snack";
  if (med <= 60) return "Quick";
  if (med <= 120) return "Standard";
  return "Marathon";
}

function eraTier(med: number, owned: number): EraTier | null {
  if (owned < 10) return null;
  if (med < 2000) return "Vintage";
  if (med >= 2020) return "Trendsetter";
  return "Modern";
}

function raterTier(avg: number, spread: number): RaterTier {
  if (spread < 0.5) return "Diplomatic";
  if (avg >= 4.2) return "Generous";
  if (avg <= 3.0) return "Tough crowd";
  return "Discerning";
}

function modePlayerCount(games: GameForTaste[]): number | null {
  if (games.length === 0) return null;
  const counts = new Map<number, number>();
  for (const g of games) {
    const max = g.maxPlayers || 0;
    if (max < 2) continue;
    const sweet = Math.min(max, Math.max(g.minPlayers, 4));
    counts.set(sweet, (counts.get(sweet) ?? 0) + 1);
  }
  let best = -1;
  let bestCount = 0;
  for (const [k, v] of counts) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best > 0 ? best : null;
}

function tagLeans(games: GameForTaste[]): { loves: string[]; allergies: string[] } {
  if (games.length === 0) return { loves: [], allergies: [] };
  const counts = new Map<string, number>();
  for (const g of games) {
    for (const c of g.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    for (const m of g.mechanics) counts.set(m, (counts.get(m) ?? 0) + 1);
  }

  const loves: { name: string; share: number }[] = [];
  const allergies: string[] = [];
  for (const tag of SIGNAL_TAGS) {
    const count = counts.get(tag) ?? 0;
    const share = count / games.length;
    if (share >= 0.2) loves.push({ name: TAG_LABELS[tag] ?? tag, share });
    if (share === 0 && games.length >= 50) allergies.push(TAG_LABELS[tag] ?? tag);
  }
  loves.sort((a, b) => b.share - a.share);
  return {
    loves: loves.slice(0, 3).map((l) => l.name),
    allergies: allergies.slice(0, 3),
  };
}

interface ArchetypeInputs {
  complexity: ComplexityTier | null;
  variance: number;
  coopShare: number;
  partyShare: number;
  familyShare: number;
  warShare: number;
  fantasyShare: number;
  euroShare: number;
  ownedCount: number;
}

function pickArchetype(o: ArchetypeInputs): { name: string; tagline: string } {
  if (o.complexity === "Heavy" && o.coopShare >= 0.3) {
    return { name: "Cooperative Mastermind", tagline: "Heavy strategy without the conflict." };
  }
  if (o.complexity === "Heavy" && o.variance < 0.6 && o.euroShare >= 0.3) {
    return { name: "The Purist", tagline: "Tight engines, no gimmicks." };
  }
  if (o.complexity === "Heavy" && o.ownedCount >= 50 && o.variance >= 0.8) {
    return { name: "The Completionist", tagline: "Owns it all. Plays it all." };
  }
  if (o.complexity === "Heavy" && o.warShare >= 0.2) {
    return { name: "Armchair General", tagline: "Long evenings, longer campaigns." };
  }
  if (o.complexity === "Light" && o.partyShare >= 0.25) {
    return { name: "Cocktail Hour Host", tagline: "Loud table, full glasses." };
  }
  if (o.complexity === "Light" && o.familyShare >= 0.25) {
    return { name: "Gateway Steward", tagline: "Bringing new players in, one rulebook at a time." };
  }
  if (o.complexity === "Medium" && o.fantasyShare >= 0.3) {
    return { name: "Gateway Adventurer", tagline: "Theme-first, mechanics-second." };
  }
  if (o.complexity === "Medium" && o.coopShare >= 0.3) {
    return { name: "The Diplomat", tagline: "Plays well with others." };
  }
  if (o.variance >= 0.9 && o.ownedCount >= 30) {
    return { name: "Renaissance Player", tagline: "Light, heavy, anywhere in between." };
  }
  if (o.complexity === "Heavy")
    return { name: "The Strategist", tagline: "Plans three turns ahead." };
  if (o.complexity === "Medium")
    return { name: "The Tactician", tagline: "Balanced taste, sharp instincts." };
  if (o.complexity === "Light")
    return { name: "The Connoisseur", tagline: "Quick games, real conversations." };
  return { name: "The Newcomer", tagline: "Just getting started." };
}

function ratingWeight(g: GameForTaste): number {
  if (g.isFavorite) return 1.5;
  if (g.userStars === 5) return 1.4;
  if (g.userStars === 4) return 1.2;
  if (g.userStars === 1) return 0.5;
  if (g.userStars === 2) return 0.7;
  return 1;
}

export function buildTasteProfile(games: GameForTaste[]): TasteProfile {
  const ownedCount = games.length;
  const ratedGames = games.filter((g) => g.userStars != null);
  const ratedCount = ratedGames.length;

  if (ownedCount < 5) {
    return {
      ready: false,
      ownedCount,
      ratedCount,
      archetype: {
        name: "Untasted Palate",
        tagline: "Add a few games to reveal a profile.",
      },
      complexity: null,
      attention: null,
      sweetSpot: null,
      era: null,
      rater: null,
      coopShare: 0,
      loves: [],
      allergies: [],
      highlights: [],
    };
  }

  const complexGames = games.filter(
    (g): g is GameForTaste & { complexity: number } => g.complexity != null
  );
  let complexValue = 0;
  let complexVariance = 0;
  if (complexGames.length > 0) {
    let sumW = 0;
    let sumWC = 0;
    for (const g of complexGames) {
      const w = ratingWeight(g);
      sumW += w;
      sumWC += w * g.complexity;
    }
    complexValue = sumWC / sumW;
    complexVariance = stdDev(complexGames.map((g) => g.complexity));
  }
  const cTier: ComplexityTier | null =
    complexGames.length > 0 ? complexityTier(complexValue) : null;

  const playtimes = games.map((g) => Math.max(g.maxPlaytime, g.minPlaytime)).filter((t) => t > 0);
  const mPlay = playtimes.length > 0 ? median(playtimes) : 0;
  const aTier = playtimes.length > 0 ? attentionTier(mPlay) : null;

  const sweet = modePlayerCount(games);

  const years = games.map((g) => g.yearPublished).filter((y): y is number => y != null && y > 1900);
  const mYear = years.length > 0 ? median(years) : 0;
  const era = years.length > 0 ? eraTier(mYear, ownedCount) : null;

  let rater: TasteProfile["rater"] = null;
  if (ratedCount >= 5) {
    const stars = ratedGames.map((g) => g.userStars as number);
    const avg = mean(stars);
    const spread = stdDev(stars);
    rater = { tier: raterTier(avg, spread), avg, spread };
  }

  const coopShare = shareWith(games, COOP_MECHANICS, "mechanics");
  const partyShare = shareWith(games, PARTY_KEYS, "categories");
  const familyShare = shareWith(games, FAMILY_KEYS, "categories");
  const warShare = shareWith(games, WAR_KEYS, "categories");
  const fantasyShare = shareWith(games, FANTASY_KEYS, "categories");
  const euroShare = shareWith(games, EURO_MECHANICS, "mechanics");

  const { loves, allergies } = tagLeans(games);

  const archetype = pickArchetype({
    complexity: cTier,
    variance: complexVariance,
    coopShare,
    partyShare,
    familyShare,
    warShare,
    fantasyShare,
    euroShare,
    ownedCount,
  });

  const highlights: string[] = [];
  if (sweet && aTier && playtimes.length > 0) {
    highlights.push(`Sweet spot: ${sweet} players, ${Math.round(mPlay)} min`);
  } else if (sweet) {
    highlights.push(`Sweet spot: ${sweet} players`);
  }
  if (era === "Vintage") highlights.push("Leans pre-2000 — classic taste");
  if (era === "Trendsetter") highlights.push("Mostly 2020+ — chasing new releases");
  if (coopShare >= 0.3) highlights.push(`${Math.round(coopShare * 100)}% cooperative`);
  if (rater) {
    const word =
      rater.tier === "Generous"
        ? "Generous rater"
        : rater.tier === "Tough crowd"
          ? "Tough crowd"
          : rater.tier === "Discerning"
            ? "Discerning palate"
            : "Diplomatic ratings";
    highlights.push(`${word} (avg ${rater.avg.toFixed(1)} ★)`);
  }

  return {
    ready: true,
    ownedCount,
    ratedCount,
    archetype,
    complexity: cTier
      ? { tier: cTier, value: complexValue, specialist: complexVariance < 0.5 }
      : null,
    attention: aTier ? { tier: aTier, medianMinutes: Math.round(mPlay) } : null,
    sweetSpot: sweet,
    era,
    rater,
    coopShare,
    loves,
    allergies,
    highlights,
  };
}
