-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('NORMAL', 'TEMPLATE', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('LIVE', 'LOCAL', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "frozen" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "roomType" "RoomType" NOT NULL DEFAULT 'NORMAL',
    "status" "RoomStatus" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "excalidrawUrl" TEXT NOT NULL,
    "readOnlyUrl" TEXT,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Room_excalidrawUrl_key" ON "Room"("excalidrawUrl");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
