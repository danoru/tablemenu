/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Rooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Rooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rooms" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rooms_code_key" ON "Rooms"("code");
