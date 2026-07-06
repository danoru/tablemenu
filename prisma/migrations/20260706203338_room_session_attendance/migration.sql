-- CreateTable
CREATE TABLE "RoomSessionAttendance" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomSessionAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomSessionAttendance_sessionId_userId_key" ON "RoomSessionAttendance"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "RoomSessionAttendance" ADD CONSTRAINT "RoomSessionAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RoomSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomSessionAttendance" ADD CONSTRAINT "RoomSessionAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
