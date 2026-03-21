import { Games, UserGames, Users } from "@prisma/client";
import prisma from "./db";

export async function getAllUsers() {
  return prisma.users.findMany({
    orderBy: { username: "asc" },
  });
}

export async function getUserById(id: number, includeCollection = false) {
  return prisma.users.findUnique({
    where: { id },
    include: includeCollection ? { collection: { include: { game: true } } } : undefined,
  });
}

export async function getUserWithCollection(
  username: string
): Promise<(Users & { collection: (UserGames & { game: Games })[] }) | null> {
  return prisma.users.findUnique({
    where: { username },
    include: {
      collection: {
        include: { game: true },
      },
    },
  });
}
