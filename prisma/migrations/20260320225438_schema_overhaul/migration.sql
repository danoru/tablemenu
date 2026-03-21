/*
  Warnings:

  - You are about to drop the column `playtime` on the `Games` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `RoomGameSuggestions` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `UserGameRatings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bggId]` on the table `Games` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomId,gameId]` on the table `RoomGameSuggestions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maxPlaytime` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPlaytime` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stars` to the `UserGameRatings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Following" DROP CONSTRAINT "Following_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoomGameSuggestions" DROP CONSTRAINT "RoomGameSuggestions_gameId_fkey";

-- DropForeignKey
ALTER TABLE "RoomGameSuggestions" DROP CONSTRAINT "RoomGameSuggestions_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomInvites" DROP CONSTRAINT "RoomInvites_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomInvites" DROP CONSTRAINT "RoomInvites_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserGameRatings" DROP CONSTRAINT "UserGameRatings_gameId_fkey";

-- DropForeignKey
ALTER TABLE "UserGameRatings" DROP CONSTRAINT "UserGameRatings_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserGames" DROP CONSTRAINT "UserGames_gameId_fkey";

-- DropForeignKey
ALTER TABLE "UserGames" DROP CONSTRAINT "UserGames_userId_fkey";

-- AlterTable
ALTER TABLE "Games" DROP COLUMN "playtime",
ADD COLUMN     "bggId" INTEGER,
ADD COLUMN     "bggLastSynced" TIMESTAMP(3),
ADD COLUMN     "maxPlaytime" INTEGER NOT NULL,
ADD COLUMN     "minPlaytime" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RoomGameSuggestions" DROP COLUMN "rating";

-- AlterTable
ALTER TABLE "Rooms" ADD COLUMN     "playerCount" INTEGER,
ADD COLUMN     "timeBudget" INTEGER;

-- AlterTable
ALTER TABLE "UserGameRatings" DROP COLUMN "rating",
ADD COLUMN     "review" TEXT,
ADD COLUMN     "stars" SMALLINT NOT NULL;

-- AlterTable
ALTER TABLE "UserGames" ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "RoomGameVotes" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "interested" BOOLEAN NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomGameVotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomGameVotes_roomId_gameId_userId_key" ON "RoomGameVotes"("roomId", "gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Games_bggId_key" ON "Games"("bggId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomGameSuggestions_roomId_gameId_key" ON "RoomGameSuggestions"("roomId", "gameId");

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_followingUserId_fkey" FOREIGN KEY ("followingUserId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGames" ADD CONSTRAINT "UserGames_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGames" ADD CONSTRAINT "UserGames_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameRatings" ADD CONSTRAINT "UserGameRatings_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameRatings" ADD CONSTRAINT "UserGameRatings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvites" ADD CONSTRAINT "RoomInvites_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvites" ADD CONSTRAINT "RoomInvites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGameSuggestions" ADD CONSTRAINT "RoomGameSuggestions_suggestedBy_fkey" FOREIGN KEY ("suggestedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGameSuggestions" ADD CONSTRAINT "RoomGameSuggestions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGameSuggestions" ADD CONSTRAINT "RoomGameSuggestions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGameVotes" ADD CONSTRAINT "RoomGameVotes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGameVotes" ADD CONSTRAINT "RoomGameVotes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGameVotes" ADD CONSTRAINT "RoomGameVotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
