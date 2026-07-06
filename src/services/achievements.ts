import prisma from "@data/db";

type AchievementCheckContext =
  | { event: "GAME_ADDED" }
  | { event: "GAME_RATED" }
  | { event: "ROOM_JOINED" }
  | { event: "SESSION_OPENED" }
  | { event: "SESSION_CLOSED"; sessionId: number }
  | { event: "FOLLOWED_USER" }
  | { event: "GAINED_FOLLOWER" };

export async function checkAchievements(
  userId: number,
  context: AchievementCheckContext
): Promise<void> {
  try {
    switch (context.event) {
      case "GAME_ADDED":
        await checkLibraryAchievements(userId);
        break;
      case "GAME_RATED":
        await checkRatingAchievements(userId);
        break;
      case "ROOM_JOINED":
        await checkSocialAchievements(userId);
        break;
      case "SESSION_OPENED":
      case "SESSION_CLOSED":
        await checkSocialAchievements(userId);
        await checkStreakAchievements(userId);
        break;
      case "FOLLOWED_USER":
        await checkFollowAchievements(userId, "following");
        break;
      case "GAINED_FOLLOWER":
        await checkFollowAchievements(userId, "followers");
        break;
    }
  } catch (err) {
    console.error("[achievements] check failed:", err);
  }
}
async function checkLibraryAchievements(userId: number) {
  const awards: PendingAward[] = [];
  const library = await prisma.userGames.findMany({
    where: { userId, isWishlist: false },
    include: { game: true },
  });

  const wishlist = await prisma.userGames.count({ where: { userId, isWishlist: true } });
  const count = library.length;

  maybeAward(awards, "LIBRARY_FIRST", count >= 1, count);
  maybeAward(awards, "LIBRARY_10", count >= 10, count);
  maybeAward(awards, "LIBRARY_25", count >= 25, count);
  maybeAward(awards, "LIBRARY_50", count >= 50, count);
  maybeAward(awards, "LIBRARY_100", count >= 100, count);
  maybeAward(awards, "WISHLIST_10", wishlist >= 10, wishlist);

  const currentYear = new Date().getFullYear();
  const hasVintage = library.some((ug) => (ug.game.yearPublished ?? 9999) < 1990);
  const hasNewRelease = library.some((ug) => (ug.game.yearPublished ?? 0) >= currentYear - 1);
  maybeAward(awards, "LIBRARY_YEAR_OLD", hasVintage);
  maybeAward(awards, "LIBRARY_NEW", hasNewRelease);

  const allCountries = library.flatMap((ug) => ug.game.countries);
  const uniqueCountries = new Set(allCountries);
  const CONTINENT_MAP: Record<string, string> = {
    Germany: "Europe",
    France: "Europe",
    Italy: "Europe",
    Spain: "Europe",
    Poland: "Europe",
    "Czech Republic": "Europe",
    Netherlands: "Europe",
    Sweden: "Europe",
    Denmark: "Europe",
    Finland: "Europe",
    Norway: "Europe",
    Austria: "Europe",
    Belgium: "Europe",
    Switzerland: "Europe",
    Portugal: "Europe",
    Japan: "Asia",
    China: "Asia",
    Korea: "Asia",
    Taiwan: "Asia",
    India: "Asia",
    "United States": "North America",
    Canada: "North America",
    Mexico: "North America",
    Brazil: "South America",
    Argentina: "South America",
    Chile: "South America",
    Australia: "Oceania",
    "New Zealand": "Oceania",
    "South Africa": "Africa",
    Egypt: "Africa",
    Nigeria: "Africa",
  };
  const uniqueContinents = new Set(
    [...uniqueCountries].map((c) => CONTINENT_MAP[c]).filter(Boolean)
  );
  const europeanGames = library.filter((ug) =>
    ug.game.countries.some((c) => CONTINENT_MAP[c] === "Europe")
  ).length;
  const hasJapanese = library.some((ug) => ug.game.countries.includes("Japan"));

  maybeAward(awards, "GEO_COUNTRIES_3", uniqueCountries.size >= 3, uniqueCountries.size);
  maybeAward(awards, "GEO_COUNTRIES_5", uniqueCountries.size >= 5, uniqueCountries.size);
  maybeAward(awards, "GEO_COUNTRIES_10", uniqueCountries.size >= 10, uniqueCountries.size);
  maybeAward(awards, "GEO_CONTINENTS_3", uniqueContinents.size >= 3, uniqueContinents.size);
  maybeAward(awards, "GEO_EUROPE", europeanGames >= 5, europeanGames);
  maybeAward(awards, "GEO_JAPAN", hasJapanese);

  const allCategories = library.flatMap((ug) => ug.game.categories);
  const uniqueCategories = new Set(allCategories);
  const catCount = (cat: string) => library.filter((ug) => ug.game.categories.includes(cat)).length;

  maybeAward(awards, "CAT_DIVERSE_5", uniqueCategories.size >= 5, uniqueCategories.size);
  maybeAward(awards, "CAT_DIVERSE_10", uniqueCategories.size >= 10, uniqueCategories.size);
  maybeAward(awards, "CAT_WAR", catCount("Wargame") >= 3 || catCount("War") >= 3);
  maybeAward(awards, "CAT_MYSTERY", catCount("Deduction") >= 3 || catCount("Murder/Mystery") >= 3);
  maybeAward(awards, "CAT_FANTASY", catCount("Fantasy") >= 5);
  maybeAward(
    awards,
    "CAT_HISTORY",
    catCount("Ancient") >= 3 || catCount("Medieval") >= 3 || catCount("World War II") >= 3
  );
  maybeAward(awards, "CAT_PARTY", catCount("Party Game") >= 5);
  maybeAward(
    awards,
    "CAT_COOP",
    catCount("Cooperative") >= 5 || catCount("Co-operative Play") >= 5
  );
  maybeAward(awards, "CAT_HORROR", catCount("Horror") >= 3);

  const mechCount = (mech: string) =>
    library.filter((ug) => ug.game.mechanics.includes(mech)).length;
  const hasMech = (mech: string) => library.some((ug) => ug.game.mechanics.includes(mech));

  maybeAward(
    awards,
    "MECH_DECK_BUILD",
    mechCount("Deck Building") >= 3 || mechCount("Deck, Bag, and Pool Building") >= 3
  );
  maybeAward(awards, "MECH_WORKER", mechCount("Worker Placement") >= 3);
  maybeAward(awards, "MECH_DICE", mechCount("Dice Rolling") >= 5);
  maybeAward(
    awards,
    "MECH_AREA",
    mechCount("Area Control") >= 3 || mechCount("Area Majority / Influence") >= 3
  );
  maybeAward(awards, "MECH_DRAFT", mechCount("Card Drafting") >= 3 || mechCount("Draft") >= 3);
  maybeAward(
    awards,
    "MECH_LEGACY",
    hasMech("Legacy Game") || hasMech("Campaign / Battle Card Driven")
  );
  maybeAward(
    awards,
    "MECH_ASYMMETRIC",
    mechCount("Asymmetric Roles") >= 3 || mechCount("Roles with Asymmetric Information") >= 3
  );
  maybeAward(
    awards,
    "MECH_TRAITOR",
    mechCount("Traitor Game") >= 2 || mechCount("Hidden Roles") >= 2
  );

  const weights = library.map((ug) => ug.game.complexity).filter((w): w is number => w !== null);
  const lightCount = weights.filter((w) => w < 2.0).length;
  const mediumCount = weights.filter((w) => w >= 3.0).length;
  const hasHeavy = weights.some((w) => w > 4.0);
  const hasAllTiers =
    weights.some((w) => w < 2.0) &&
    weights.some((w) => w >= 2.0 && w < 3.0) &&
    weights.some((w) => w >= 3.0 && w < 4.0) &&
    weights.some((w) => w >= 4.0);

  maybeAward(awards, "WEIGHT_LIGHT", lightCount >= 5, lightCount);
  maybeAward(awards, "WEIGHT_MEDIUM", mediumCount >= 5, mediumCount);
  maybeAward(awards, "WEIGHT_HEAVY", hasHeavy);
  maybeAward(awards, "WEIGHT_SPECTRUM", hasAllTiers);

  await flushAwards(userId, awards);
}

async function checkRatingAchievements(userId: number) {
  const awards: PendingAward[] = [];
  const ratings = await prisma.userGameRatings.findMany({ where: { userId } });
  const count = ratings.length;

  maybeAward(awards, "RATE_FIRST", count >= 1, count);
  maybeAward(awards, "RATE_10", count >= 10, count);
  maybeAward(awards, "RATE_25", count >= 25, count);
  maybeAward(
    awards,
    "RATE_PERFECT",
    ratings.some((r) => r.stars === 5)
  );
  maybeAward(
    awards,
    "RATE_HARSH",
    ratings.some((r) => r.stars === 1)
  );

  await flushAwards(userId, awards);
}

async function checkSocialAchievements(userId: number) {
  const awards: PendingAward[] = [];
  const joinedRooms = await prisma.roomInvites.count({ where: { userId, status: "ACCEPTED" } });
  maybeAward(awards, "SOCIAL_JOIN_ROOM", joinedRooms >= 1);

  const sessions = await prisma.roomSessions.findMany({
    where: { hostId: userId, status: "CLOSED" },
    include: { room: true },
  });
  const sessionCount = sessions.length;

  maybeAward(awards, "SOCIAL_HOST_FIRST", sessionCount >= 1, sessionCount);
  maybeAward(awards, "SOCIAL_HOST_5", sessionCount >= 5, sessionCount);
  maybeAward(awards, "SOCIAL_HOST_25", sessionCount >= 25, sessionCount);

  const bigNight = sessions.some((s) => (s.playerCount ?? 0) >= 6);
  maybeAward(awards, "SOCIAL_BIGGROUP", bigNight);

  const hostedRoomIds = await prisma.rooms.findMany({
    where: { hostId: userId },
    select: { id: true },
  });
  const roomIds = hostedRoomIds.map((r) => r.id);
  const uniquePlayers = await prisma.roomInvites.groupBy({
    by: ["userId"],
    where: { roomId: { in: roomIds }, status: "ACCEPTED", userId: { not: userId } },
  });
  maybeAward(awards, "SOCIAL_PLAYERS_10", uniquePlayers.length >= 10, uniquePlayers.length);

  await flushAwards(userId, awards);
}

async function checkFollowAchievements(userId: number, direction: "following" | "followers") {
  const awards: PendingAward[] = [];
  if (direction === "following") {
    const count = await prisma.following.count({ where: { userId } });
    maybeAward(awards, "SOCIAL_FOLLOW_10", count >= 10, count);
  } else {
    const count = await prisma.following.count({ where: { followingUserId: userId } });
    maybeAward(awards, "SOCIAL_FOLLOWED_10", count >= 10, count);
  }
  await flushAwards(userId, awards);
}

async function checkStreakAchievements(userId: number) {
  const awards: PendingAward[] = [];
  const sessions = await prisma.roomSessions.findMany({
    where: { hostId: userId, status: "CLOSED", closedAt: { not: null } },
    orderBy: { closedAt: "desc" },
  });

  if (sessions.length === 0) return;

  let streak = 1;
  let maxStreak = 1;
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const TOLERANCE = 2 * 24 * 60 * 60 * 1000;

  for (let i = 1; i < sessions.length; i++) {
    const prev = sessions[i - 1].closedAt!.getTime();
    const curr = sessions[i].closedAt!.getTime();
    const diff = prev - curr;

    if (diff >= MS_WEEK - TOLERANCE && diff <= MS_WEEK + TOLERANCE) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else if (diff > MS_WEEK + TOLERANCE) {
      break;
    }
  }

  maybeAward(awards, "STREAK_4", streak >= 4, streak);
  maybeAward(awards, "STREAK_8", streak >= 8, streak);
  maybeAward(awards, "STREAK_12", streak >= 12, streak);
  maybeAward(awards, "STREAK_52", streak >= 52, streak);

  await flushAwards(userId, awards);
}

interface PendingAward {
  key: string;
  progress: number | null;
}

function maybeAward(awards: PendingAward[], key: string, condition: boolean, progress?: number) {
  if (!condition) return;
  awards.push({ key, progress: progress ?? null });
}

// The achievements table is static seed data — cache the key→id map for the
// life of the process instead of one findUnique per candidate award.
let achievementIdByKey: Map<string, number> | null = null;

async function getAchievementMap(): Promise<Map<string, number>> {
  if (!achievementIdByKey) {
    const all = await prisma.achievements.findMany({ select: { id: true, key: true } });
    achievementIdByKey = new Map(all.map((a) => [a.key, a.id]));
  }
  return achievementIdByKey;
}

async function flushAwards(userId: number, awards: PendingAward[]): Promise<void> {
  if (awards.length === 0) return;

  const keyMap = await getAchievementMap();
  const wanted = awards.flatMap((a) => {
    const achievementId = keyMap.get(a.key);
    return achievementId === undefined ? [] : [{ achievementId, progress: a.progress }];
  });
  if (wanted.length === 0) return;

  const existing = await prisma.userAchievements.findMany({
    where: { userId, achievementId: { in: wanted.map((w) => w.achievementId) } },
    select: { achievementId: true, progress: true },
  });
  const existingProgress = new Map(existing.map((e) => [e.achievementId, e.progress]));

  const toCreate = wanted.filter((w) => !existingProgress.has(w.achievementId));
  if (toCreate.length > 0) {
    await prisma.userAchievements.createMany({
      data: toCreate.map((w) => ({ userId, achievementId: w.achievementId, progress: w.progress })),
      skipDuplicates: true,
    });
  }

  const toUpdate = wanted.filter(
    (w) =>
      existingProgress.has(w.achievementId) && existingProgress.get(w.achievementId) !== w.progress
  );
  for (const w of toUpdate) {
    await prisma.userAchievements.update({
      where: { userId_achievementId: { userId, achievementId: w.achievementId } },
      data: { progress: w.progress },
    });
  }
}
