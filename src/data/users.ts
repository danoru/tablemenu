import { Games, UserGames, Users } from "@prisma/client";

import prisma from "./db";

/**
 * Seeded fixtures, not people. Kept alongside the prefixes below so every
 * social surface hides the same set.
 */
export const SYSTEM_USERNAMES = ["guest"];

/**
 * The QA harness registers throwaway accounts as `host_<digits>` /
 * `memb_<digits>`. They're bots — nobody should be able to find, follow, or be
 * followed by one — and `register.ts` reserves these prefixes so a real player
 * can never end up hidden by this rule.
 */
export const SYSTEM_USERNAME_PREFIXES = ["host_", "memb_"];

/** Prisma `where` fragment that drops the accounts above from a user query. */
export const NOT_SYSTEM_USER = {
  username: { notIn: SYSTEM_USERNAMES },
  NOT: SYSTEM_USERNAME_PREFIXES.map((prefix) => ({ username: { startsWith: prefix } })),
};

export function isSystemUsername(username: string): boolean {
  const name = username.toLowerCase();
  return (
    SYSTEM_USERNAMES.includes(name) || SYSTEM_USERNAME_PREFIXES.some((p) => name.startsWith(p))
  );
}

/** The only user columns safe to ship to a browser. Never widen this to `*` — the
 *  players directory is public, and a bare `findMany` puts every password hash
 *  in the page's SSR payload. */
export const PUBLIC_USER_FIELDS = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  bio: true,
  location: true,
  website: true,
  image: true,
  badge: true,
  joinDate: true,
} as const;

export type PublicUser = Pick<Users, keyof typeof PUBLIC_USER_FIELDS>;

export async function getAllUsers(): Promise<PublicUser[]> {
  return prisma.users.findMany({
    where: NOT_SYSTEM_USER,
    select: PUBLIC_USER_FIELDS,
    orderBy: { username: "asc" },
  });
}

export async function getUserById(id: number, includeCollection = false) {
  return prisma.users.findUnique({
    where: { id },
    select: {
      ...PUBLIC_USER_FIELDS,
      ...(includeCollection ? { collection: { include: { game: true } } } : {}),
    },
  });
}

export async function getUserWithCollection(
  username: string
): Promise<(PublicUser & { collection: (UserGames & { game: Games })[] }) | null> {
  return prisma.users.findUnique({
    where: { username },
    select: {
      ...PUBLIC_USER_FIELDS,
      collection: { include: { game: true } },
    },
  });
}
