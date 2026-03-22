import prisma from "@data/db";

// ─── Types ────────────────────────────────────────────────────────────────────

type AchievementCheckContext =
  | { event: "GAME_ADDED" }
  | { event: "GAME_RATED" }
  | { event: "ROOM_JOINED" }
  | { event: "SESSION_OPENED" }
  | { event: "SESSION_CLOSED"; sessionId: number }
  | { event: "FOLLOWED_USER" }
  | { event: "GAINED_FOLLOWER" };

// ─── Main checker ─────────────────────────────────────────────────────────────
// Call this after any action that could trigger an achievement.
// It checks eligibility and upserts UserAchievements rows.

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
    // Achievement checks should never break the main action
    console.error("[achievements] check failed:", err);
  }
}

// ─── Library achievements ─────────────────────────────────────────────────────

async function checkLibraryAchievements(userId: number) {
  const library = await prisma.userGames.findMany({
    where: { userId, isWishlist: false },
    include: { game: true },
  });

  const wishlist = await prisma.userGames.count({ where: { userId, isWishlist: true } });
  const count = library.length;

  // Size-based
  await maybeAward(userId, "LIBRARY_FIRST", count >= 1, count);
  await maybeAward(userId, "LIBRARY_10", count >= 10, count);
  await maybeAward(userId, "LIBRARY_25", count >= 25, count);
  await maybeAward(userId, "LIBRARY_50", count >= 50, count);
  await maybeAward(userId, "LIBRARY_100", count >= 100, count);
  await maybeAward(userId, "WISHLIST_10", wishlist >= 10, wishlist);

  // Year-based
  const currentYear = new Date().getFullYear();
  const hasVintage = library.some((ug) => (ug.game.yearPublished ?? 9999) < 1990);
  const hasNewRelease = library.some((ug) => (ug.game.yearPublished ?? 0) >= currentYear - 1);
  await maybeAward(userId, "LIBRARY_YEAR_OLD", hasVintage);
  await maybeAward(userId, "LIBRARY_NEW", hasNewRelease);

  // Geography
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

  await maybeAward(userId, "GEO_COUNTRIES_3", uniqueCountries.size >= 3, uniqueCountries.size);
  await maybeAward(userId, "GEO_COUNTRIES_5", uniqueCountries.size >= 5, uniqueCountries.size);
  await maybeAward(userId, "GEO_COUNTRIES_10", uniqueCountries.size >= 10, uniqueCountries.size);
  await maybeAward(userId, "GEO_CONTINENTS_3", uniqueContinents.size >= 3, uniqueContinents.size);
  await maybeAward(userId, "GEO_EUROPE", europeanGames >= 5, europeanGames);
  await maybeAward(userId, "GEO_JAPAN", hasJapanese);

  // Categories
  const allCategories = library.flatMap((ug) => ug.game.categories);
  const uniqueCategories = new Set(allCategories);
  const catCount = (cat: string) => library.filter((ug) => ug.game.categories.includes(cat)).length;

  await maybeAward(userId, "CAT_DIVERSE_5", uniqueCategories.size >= 5, uniqueCategories.size);
  await maybeAward(userId, "CAT_DIVERSE_10", uniqueCategories.size >= 10, uniqueCategories.size);
  await maybeAward(userId, "CAT_WAR", catCount("Wargame") >= 3 || catCount("War") >= 3);
  await maybeAward(
    userId,
    "CAT_MYSTERY",
    catCount("Deduction") >= 3 || catCount("Murder/Mystery") >= 3
  );
  await maybeAward(userId, "CAT_FANTASY", catCount("Fantasy") >= 5);
  await maybeAward(
    userId,
    "CAT_HISTORY",
    catCount("Ancient") >= 3 || catCount("Medieval") >= 3 || catCount("World War II") >= 3
  );
  await maybeAward(userId, "CAT_PARTY", catCount("Party Game") >= 5);
  await maybeAward(
    userId,
    "CAT_COOP",
    catCount("Cooperative") >= 5 || catCount("Co-operative Play") >= 5
  );
  await maybeAward(userId, "CAT_HORROR", catCount("Horror") >= 3);

  // Mechanics
  const mechCount = (mech: string) =>
    library.filter((ug) => ug.game.mechanics.includes(mech)).length;
  const hasMech = (mech: string) => library.some((ug) => ug.game.mechanics.includes(mech));

  await maybeAward(
    userId,
    "MECH_DECK_BUILD",
    mechCount("Deck Building") >= 3 || mechCount("Deck, Bag, and Pool Building") >= 3
  );
  await maybeAward(userId, "MECH_WORKER", mechCount("Worker Placement") >= 3);
  await maybeAward(userId, "MECH_DICE", mechCount("Dice Rolling") >= 5);
  await maybeAward(
    userId,
    "MECH_AREA",
    mechCount("Area Control") >= 3 || mechCount("Area Majority / Influence") >= 3
  );
  await maybeAward(
    userId,
    "MECH_DRAFT",
    mechCount("Card Drafting") >= 3 || mechCount("Draft") >= 3
  );
  await maybeAward(
    userId,
    "MECH_LEGACY",
    hasMech("Legacy Game") || hasMech("Campaign / Battle Card Driven")
  );
  await maybeAward(
    userId,
    "MECH_ASYMMETRIC",
    mechCount("Asymmetric Roles") >= 3 || mechCount("Roles with Asymmetric Information") >= 3
  );
  await maybeAward(
    userId,
    "MECH_TRAITOR",
    mechCount("Traitor Game") >= 2 || mechCount("Hidden Roles") >= 2
  );

  // Complexity
  const weights = library.map((ug) => ug.game.complexity).filter((w): w is number => w !== null);
  const lightCount = weights.filter((w) => w < 2.0).length;
  const mediumCount = weights.filter((w) => w >= 3.0).length;
  const hasHeavy = weights.some((w) => w > 4.0);
  const hasAllTiers =
    weights.some((w) => w < 2.0) &&
    weights.some((w) => w >= 2.0 && w < 3.0) &&
    weights.some((w) => w >= 3.0 && w < 4.0) &&
    weights.some((w) => w >= 4.0);

  await maybeAward(userId, "WEIGHT_LIGHT", lightCount >= 5, lightCount);
  await maybeAward(userId, "WEIGHT_MEDIUM", mediumCount >= 5, mediumCount);
  await maybeAward(userId, "WEIGHT_HEAVY", hasHeavy);
  await maybeAward(userId, "WEIGHT_SPECTRUM", hasAllTiers);
}

// ─── Rating achievements ──────────────────────────────────────────────────────

async function checkRatingAchievements(userId: number) {
  const ratings = await prisma.userGameRatings.findMany({ where: { userId } });
  const count = ratings.length;

  await maybeAward(userId, "RATE_FIRST", count >= 1, count);
  await maybeAward(userId, "RATE_10", count >= 10, count);
  await maybeAward(userId, "RATE_25", count >= 25, count);
  await maybeAward(
    userId,
    "RATE_PERFECT",
    ratings.some((r) => r.stars === 5)
  );
  await maybeAward(
    userId,
    "RATE_HARSH",
    ratings.some((r) => r.stars === 1)
  );
}

// ─── Social achievements ──────────────────────────────────────────────────────

async function checkSocialAchievements(userId: number) {
  // Rooms joined
  const joinedRooms = await prisma.roomInvites.count({ where: { userId, status: "ACCEPTED" } });
  await maybeAward(userId, "SOCIAL_JOIN_ROOM", joinedRooms >= 1);

  // Sessions hosted
  const sessions = await prisma.roomSessions.findMany({
    where: { hostId: userId, status: "CLOSED" },
    include: { room: true },
  });
  const sessionCount = sessions.length;

  await maybeAward(userId, "SOCIAL_HOST_FIRST", sessionCount >= 1, sessionCount);
  await maybeAward(userId, "SOCIAL_HOST_5", sessionCount >= 5, sessionCount);
  await maybeAward(userId, "SOCIAL_HOST_25", sessionCount >= 25, sessionCount);

  // Big group night
  const bigNight = sessions.some((s) => (s.playerCount ?? 0) >= 6);
  await maybeAward(userId, "SOCIAL_BIGGROUP", bigNight);

  // Unique players across all hosted rooms
  const hostedRoomIds = await prisma.rooms.findMany({
    where: { hostId: userId },
    select: { id: true },
  });
  const roomIds = hostedRoomIds.map((r) => r.id);
  const uniquePlayers = await prisma.roomInvites.groupBy({
    by: ["userId"],
    where: { roomId: { in: roomIds }, status: "ACCEPTED", userId: { not: userId } },
  });
  await maybeAward(userId, "SOCIAL_PLAYERS_10", uniquePlayers.length >= 10, uniquePlayers.length);
}

// ─── Follow achievements ──────────────────────────────────────────────────────

async function checkFollowAchievements(userId: number, direction: "following" | "followers") {
  if (direction === "following") {
    const count = await prisma.following.count({ where: { userId } });
    await maybeAward(userId, "SOCIAL_FOLLOW_10", count >= 10, count);
  } else {
    const count = await prisma.following.count({ where: { followingUserId: userId } });
    await maybeAward(userId, "SOCIAL_FOLLOWED_10", count >= 10, count);
  }
}

// ─── Streak achievements ──────────────────────────────────────────────────────

async function checkStreakAchievements(userId: number) {
  const sessions = await prisma.roomSessions.findMany({
    where: { hostId: userId, status: "CLOSED", closedAt: { not: null } },
    orderBy: { closedAt: "desc" },
  });

  if (sessions.length === 0) return;

  // Calculate current consecutive-week streak
  let streak = 1;
  let maxStreak = 1;
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const TOLERANCE = 2 * 24 * 60 * 60 * 1000; // ±2 day tolerance

  for (let i = 1; i < sessions.length; i++) {
    const prev = sessions[i - 1].closedAt!.getTime();
    const curr = sessions[i].closedAt!.getTime();
    const diff = prev - curr;

    if (diff >= MS_WEEK - TOLERANCE && diff <= MS_WEEK + TOLERANCE) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else if (diff > MS_WEEK + TOLERANCE) {
      break; // streak broken
    }
  }

  await maybeAward(userId, "STREAK_4", streak >= 4, streak);
  await maybeAward(userId, "STREAK_8", streak >= 8, streak);
  await maybeAward(userId, "STREAK_12", streak >= 12, streak);
  await maybeAward(userId, "STREAK_52", streak >= 52, streak);
}

// ─── Helper: award if not already awarded ─────────────────────────────────────

async function maybeAward(
  userId: number,
  key: string,
  condition: boolean,
  progress?: number
): Promise<void> {
  if (!condition) return;

  const achievement = await prisma.achievements.findUnique({ where: { key } });
  if (!achievement) return;

  await prisma.userAchievements.upsert({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
    update: { progress: progress ?? null },
    create: { userId, achievementId: achievement.id, progress: progress ?? null },
  });
}
