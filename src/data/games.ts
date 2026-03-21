import prisma from "./db";

export async function getGameById(id: number) {
  return prisma.games.findUnique({ where: { id } });
}

export async function getGameByName(name: string) {
  return prisma.games.findFirst({ where: { name } });
}
