import prisma from "@data/db";
import { NOT_SYSTEM_USER } from "@data/users";

export type FriendActivityKind = "ADDED" | "WISHLISTED" | "RATED" | "PLAYED" | "ACHIEVEMENT";

export interface FriendActivityEvent {
  /** Stable across refetches: kind + the owning row's id. */
  id: string;
  kind: FriendActivityKind;
  /** ISO timestamp — the feed is sorted on this, newest first. */
  at: string;
  username: string;
  game: { gameId: number; name: string; imageUrl: string | null } | null;
  /** RATED only. */
  stars: number | null;
  /** ACHIEVEMENT only. */
  achievement: { name: string; icon: string | null } | null;
}

/**
 * Recent activity from the people `userId` follows, newest first.
 *
 * Each source is queried for its own most recent `limit` rows and the merged
 * list is trimmed back down — a friend on a game-logging spree can crowd out
 * the others within a single refresh, but no source can be starved outright the
 * way a single UNION-with-LIMIT would allow.
 */
export async function getFriendActivity(
  userId: number,
  limit = 12
): Promise<FriendActivityEvent[]> {
  const followed = await prisma.following.findMany({
    where: { userId, following: NOT_SYSTEM_USER },
    select: { followingUserId: true },
  });

  const friendIds = followed.map((f) => f.followingUserId);
  if (friendIds.length === 0) return [];

  const gameSelect = { select: { id: true, name: true, imageUrl: true } } as const;

  const [collected, rated, played, earned] = await Promise.all([
    prisma.userGames.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { addedAt: "desc" },
      take: limit,
      select: {
        id: true,
        addedAt: true,
        isWishlist: true,
        user: { select: { username: true } },
        game: gameSelect,
      },
    }),
    prisma.userGameRatings.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { ratedAt: "desc" },
      take: limit,
      select: {
        id: true,
        ratedAt: true,
        stars: true,
        user: { select: { username: true } },
        game: gameSelect,
      },
    }),
    prisma.gameSessionPlayers.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { gameSession: { playedAt: "desc" } },
      take: limit,
      select: {
        id: true,
        user: { select: { username: true } },
        gameSession: {
          select: { playedAt: true, games: { select: { game: gameSelect } } },
        },
      },
    }),
    prisma.userAchievements.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { earnedAt: "desc" },
      take: limit,
      select: {
        id: true,
        earnedAt: true,
        user: { select: { username: true } },
        achievement: { select: { name: true, icon: true, isSecret: true } },
      },
    }),
  ]);

  const events: FriendActivityEvent[] = [];

  for (const row of collected) {
    events.push({
      id: `collected-${row.id}`,
      kind: row.isWishlist ? "WISHLISTED" : "ADDED",
      at: row.addedAt.toISOString(),
      username: row.user.username,
      game: { gameId: row.game.id, name: row.game.name, imageUrl: row.game.imageUrl },
      stars: null,
      achievement: null,
    });
  }

  for (const row of rated) {
    events.push({
      id: `rated-${row.id}`,
      kind: "RATED",
      at: row.ratedAt.toISOString(),
      username: row.user.username,
      game: { gameId: row.game.id, name: row.game.name, imageUrl: row.game.imageUrl },
      stars: row.stars,
      achievement: null,
    });
  }

  for (const row of played) {
    // A logged night can cover several games; the first is enough to name the
    // event, and the row is dropped entirely if somehow none were recorded.
    const first = row.gameSession.games[0]?.game;
    if (!first) continue;
    events.push({
      id: `played-${row.id}`,
      kind: "PLAYED",
      at: row.gameSession.playedAt.toISOString(),
      username: row.user.username,
      game: { gameId: first.id, name: first.name, imageUrl: first.imageUrl },
      stars: null,
      achievement: null,
    });
  }

  for (const row of earned) {
    // Secret achievements stay secret — announcing one in a friend's feed
    // spoils it for everybody who hasn't found it yet.
    if (row.achievement.isSecret) continue;
    events.push({
      id: `earned-${row.id}`,
      kind: "ACHIEVEMENT",
      at: row.earnedAt.toISOString(),
      username: row.user.username,
      game: null,
      stars: null,
      achievement: { name: row.achievement.name, icon: row.achievement.icon },
    });
  }

  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
