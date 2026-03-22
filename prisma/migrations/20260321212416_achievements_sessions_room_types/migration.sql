-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('CASUAL', 'RECURRING', 'VENUE');

-- CreateEnum
CREATE TYPE "RoomVisibility" AS ENUM ('PUBLIC', 'LINK_ONLY', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('LIBRARY', 'GEOGRAPHY', 'CATEGORY', 'MECHANIC', 'COMPLEXITY', 'RATINGS', 'SOCIAL', 'PLAY', 'STREAK');

-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "countries" TEXT[],
ADD COLUMN     "designers" TEXT[],
ADD COLUMN     "mechanics" TEXT[],
ADD COLUMN     "publishers" TEXT[],
ADD COLUMN     "yearPublished" INTEGER;

-- AlterTable
ALTER TABLE "Rooms" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastOpenedAt" TIMESTAMP(3),
ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'CASUAL',
ADD COLUMN     "visibility" "RoomVisibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "UserGames" ADD COLUMN     "isWishlist" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RoomPermanentGames" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "addedBy" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomPermanentGames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomSessions" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "hostId" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledFor" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "playerCount" INTEGER,
    "notes" TEXT,

    CONSTRAINT "RoomSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSessions" (
    "id" SERIAL NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMin" INTEGER,
    "notes" TEXT,
    "roomSessionId" INTEGER,

    CONSTRAINT "GameSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSessionGames" (
    "id" SERIAL NOT NULL,
    "gameSessionId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "GameSessionGames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSessionPlayers" (
    "id" SERIAL NOT NULL,
    "gameSessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "won" BOOLEAN,

    CONSTRAINT "GameSessionPlayers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "icon" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "threshold" INTEGER,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER,

    CONSTRAINT "UserAchievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomPermanentGames_roomId_gameId_key" ON "RoomPermanentGames"("roomId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionGames_gameSessionId_gameId_key" ON "GameSessionGames"("gameSessionId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionPlayers_gameSessionId_userId_key" ON "GameSessionPlayers"("gameSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_key_key" ON "Achievements"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievements_userId_achievementId_key" ON "UserAchievements"("userId", "achievementId");

-- AddForeignKey
ALTER TABLE "RoomPermanentGames" ADD CONSTRAINT "RoomPermanentGames_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomPermanentGames" ADD CONSTRAINT "RoomPermanentGames_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomSessions" ADD CONSTRAINT "RoomSessions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomSessions" ADD CONSTRAINT "RoomSessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessions" ADD CONSTRAINT "GameSessions_roomSessionId_fkey" FOREIGN KEY ("roomSessionId") REFERENCES "RoomSessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionGames" ADD CONSTRAINT "GameSessionGames_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionGames" ADD CONSTRAINT "GameSessionGames_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionPlayers" ADD CONSTRAINT "GameSessionPlayers_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionPlayers" ADD CONSTRAINT "GameSessionPlayers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievements" ADD CONSTRAINT "UserAchievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievements" ADD CONSTRAINT "UserAchievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
