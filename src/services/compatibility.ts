import type { GameForTaste } from "./tasteProfile";

export interface GameForCompat extends GameForTaste {
  name: string;
  imageUrl: string | null;
}

export interface CompatibilityRecommendation {
  gameId: number;
  name: string;
  imageUrl: string | null;
  reason: string;
}

export interface Compatibility {
  ready: boolean;
  score: number;
  headline: string;
  sharedGames: number;
  sharedFavorites: string[];
  notes: string[];
  breakdown: {
    libraryOverlap: number;
    tasteSimilarity: number;
    complexityProximity: number;
    playtimeProximity: number;
    ratingCorrelation: number | null;
  };
  recommendations: CompatibilityRecommendation[];
}

const TASTE_LABELS: Record<string, string> = {
  "c:Fantasy": "fantasy",
  "c:Wargame": "wargames",
  "c:Party Game": "party games",
  "c:Horror": "horror games",
  "c:Family Game": "family games",
  "c:Card Game": "card games",
  "c:Science Fiction": "sci-fi",
  "c:Economic": "economic games",
  "c:Adventure": "adventures",
  "c:Mystery": "mysteries",
  "m:Worker Placement": "worker placement",
  "m:Engine Building": "engine builders",
  "m:Cooperative Game": "co-ops",
  "m:Hidden Roles": "social deduction",
  "m:Deck, Bag, and Pool Building": "deck-builders",
  "m:Dice Rolling": "dice games",
  "m:Tile Placement": "tile-laying",
  "m:Area Majority / Influence": "area control",
  "m:Legacy Game": "legacy games",
};

function ratingWeight(g: GameForCompat): number {
  if (g.isFavorite) return 1.5;
  if (g.userStars === 5) return 1.4;
  if (g.userStars === 4) return 1.2;
  return 1;
}

function tasteVector(games: GameForCompat[]): Map<string, number> {
  const v = new Map<string, number>();
  if (games.length === 0) return v;
  for (const g of games) {
    const w = ratingWeight(g);
    for (const c of g.categories) v.set(`c:${c}`, (v.get(`c:${c}`) ?? 0) + w);
    for (const m of g.mechanics) v.set(`m:${m}`, (v.get(`m:${m}`) ?? 0) + w);
  }
  let total = 0;
  for (const x of v.values()) total += x;
  if (total > 0) for (const k of v.keys()) v.set(k, v.get(k)! / total);
  return v;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (const v of a.values()) aMag += v * v;
  for (const v of b.values()) bMag += v * v;
  for (const [k, v] of a) {
    const bv = b.get(k);
    if (bv) dot += v * bv;
  }
  if (aMag === 0 || bMag === 0) return 0;
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length < 3) return null;
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    sx += dx * dx;
    sy += dy * dy;
  }
  if (sx === 0 || sy === 0) return null;
  return num / Math.sqrt(sx * sy);
}

function avgComplexity(games: GameForCompat[]): number {
  const valid = games.filter((g) => g.complexity != null);
  if (valid.length === 0) return 0;
  return valid.reduce((s, g) => s + (g.complexity as number), 0) / valid.length;
}

function medianPlaytime(games: GameForCompat[]): number {
  const arr = games.map((g) => Math.max(g.maxPlaytime, g.minPlaytime)).filter((t) => t > 0);
  if (arr.length === 0) return 0;
  arr.sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
}

function topSharedTags(
  meVec: Map<string, number>,
  themVec: Map<string, number>,
  limit: number
): string[] {
  const shared: { key: string; score: number }[] = [];
  for (const [k, v] of meVec) {
    const t = themVec.get(k);
    if (!t) continue;
    if (!TASTE_LABELS[k]) continue;
    shared.push({ key: k, score: Math.min(v, t) });
  }
  shared.sort((a, b) => b.score - a.score);
  return shared.slice(0, limit).map((s) => TASTE_LABELS[s.key]);
}

function pickHeadline(score: number): string {
  if (score >= 85) return "Mind-meld at the table";
  if (score >= 70) return "You'd play well together";
  if (score >= 55) return "Plenty to share";
  if (score >= 40) return "Some common ground";
  return "Different palates";
}

export function buildCompatibility(
  meGames: GameForCompat[],
  themGames: GameForCompat[]
): Compatibility {
  if (meGames.length < 3 || themGames.length < 3) {
    return {
      ready: false,
      score: 0,
      headline: "Not enough signal yet",
      sharedGames: 0,
      sharedFavorites: [],
      notes: [],
      breakdown: {
        libraryOverlap: 0,
        tasteSimilarity: 0,
        complexityProximity: 0,
        playtimeProximity: 0,
        ratingCorrelation: null,
      },
      recommendations: [],
    };
  }

  const meById = new Map(meGames.map((g) => [g.gameId, g]));
  const themById = new Map(themGames.map((g) => [g.gameId, g]));
  const meIds = new Set(meById.keys());
  const themIds = new Set(themById.keys());

  let interW = 0;
  let unionW = 0;
  const sharedFavs: string[] = [];
  const sharedIds: number[] = [];
  for (const id of meIds) {
    const meG = meById.get(id)!;
    const wMe = meG.isFavorite ? 1.5 : 1;
    if (themIds.has(id)) {
      const themG = themById.get(id)!;
      const wThem = themG.isFavorite ? 1.5 : 1;
      interW += Math.min(wMe, wThem);
      unionW += Math.max(wMe, wThem);
      sharedIds.push(id);
      if (meG.isFavorite && themG.isFavorite) sharedFavs.push(meG.name);
    } else {
      unionW += wMe;
    }
  }
  for (const id of themIds) {
    if (meIds.has(id)) continue;
    const themG = themById.get(id)!;
    unionW += themG.isFavorite ? 1.5 : 1;
  }
  const libraryOverlap = unionW === 0 ? 0 : interW / unionW;

  const meVec = tasteVector(meGames);
  const themVec = tasteVector(themGames);
  const tasteSimilarity = cosine(meVec, themVec);

  const meCx = avgComplexity(meGames);
  const themCx = avgComplexity(themGames);
  const complexityProximity =
    meCx > 0 && themCx > 0 ? Math.max(0, 1 - Math.abs(meCx - themCx) / 2.5) : 0.5;

  const mePt = medianPlaytime(meGames);
  const themPt = medianPlaytime(themGames);
  const playtimeProximity =
    mePt > 0 && themPt > 0 ? Math.max(0, 1 - Math.abs(mePt - themPt) / 120) : 0.5;

  const xs: number[] = [];
  const ys: number[] = [];
  for (const id of sharedIds) {
    const m = meById.get(id)!;
    const t = themById.get(id)!;
    if (m.userStars != null && t.userStars != null) {
      xs.push(m.userStars);
      ys.push(t.userStars);
    }
  }
  const ratingCorrelation = pearson(xs, ys);

  const weights = { lib: 0.3, taste: 0.3, complexity: 0.15, playtime: 0.1, ratings: 0.15 };
  let total = 0;
  let used = 0;
  total += weights.lib * libraryOverlap;
  used += weights.lib;
  total += weights.taste * tasteSimilarity;
  used += weights.taste;
  total += weights.complexity * complexityProximity;
  used += weights.complexity;
  total += weights.playtime * playtimeProximity;
  used += weights.playtime;
  if (ratingCorrelation != null) {
    total += weights.ratings * ((ratingCorrelation + 1) / 2);
    used += weights.ratings;
  }
  const score = Math.round((total / used) * 100);

  const notes: string[] = [];
  if (sharedIds.length > 0) {
    notes.push(`${sharedIds.length} game${sharedIds.length === 1 ? "" : "s"} in common`);
  }
  const sharedTags = topSharedTags(meVec, themVec, 2);
  if (sharedTags.length > 0) {
    notes.push(`Both lean into ${sharedTags.join(" and ")}`);
  }
  if (meCx > 0 && themCx > 0) {
    const delta = meCx - themCx;
    if (Math.abs(delta) >= 0.6) {
      notes.push(delta > 0 ? "You skew heavier than they do" : "They skew heavier than you do");
    } else {
      notes.push("Similar appetite for complexity");
    }
  }
  if (ratingCorrelation != null) {
    if (ratingCorrelation >= 0.5) notes.push("You agree on what's good");
    else if (ratingCorrelation <= -0.3) notes.push("Wildly opposite taste in ratings");
  }

  const candidates: {
    gameId: number;
    name: string;
    imageUrl: string | null;
    reason: string;
    score: number;
  }[] = [];
  for (const g of meGames) {
    if (themIds.has(g.gameId)) continue;
    let s = 0;
    let topTag: string | null = null;
    let topTagScore = 0;
    for (const c of g.categories) {
      const k = `c:${c}`;
      const v = themVec.get(k);
      if (v) {
        s += v;
        if (v > topTagScore && TASTE_LABELS[k]) {
          topTagScore = v;
          topTag = TASTE_LABELS[k];
        }
      }
    }
    for (const m of g.mechanics) {
      const k = `m:${m}`;
      const v = themVec.get(k);
      if (v) {
        s += v;
        if (v > topTagScore && TASTE_LABELS[k]) {
          topTagScore = v;
          topTag = TASTE_LABELS[k];
        }
      }
    }
    if (s === 0) continue;
    if (g.isFavorite) s *= 1.2;
    if (g.userStars === 5) s *= 1.15;
    if (g.complexity != null && themCx > 0) {
      const cxDelta = Math.abs(g.complexity - themCx);
      s *= Math.max(0.3, 1 - cxDelta / 3);
    }
    const reason = topTag
      ? `They love ${topTag}`
      : g.isFavorite
        ? "One of your favorites"
        : "From your shelf";
    candidates.push({
      gameId: g.gameId,
      name: g.name,
      imageUrl: g.imageUrl,
      reason,
      score: s,
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  const recommendations = candidates.slice(0, 3).map(({ gameId, name, imageUrl, reason }) => ({
    gameId,
    name,
    imageUrl,
    reason,
  }));

  return {
    ready: true,
    score,
    headline: pickHeadline(score),
    sharedGames: sharedIds.length,
    sharedFavorites: sharedFavs.slice(0, 5),
    notes,
    breakdown: {
      libraryOverlap,
      tasteSimilarity,
      complexityProximity,
      playtimeProximity,
      ratingCorrelation,
    },
    recommendations,
  };
}
