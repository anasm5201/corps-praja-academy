/*
  Warnings:

  - You are about to drop the `UserAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `isPassed` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTIU` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTKP` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTWK` on the `TryoutAttempt` table. All the data in the column will be lost.
  - Added the required column `answers` to the `TryoutAttempt` table without a default value. This is not possible if the table is not empty.
  - Made the column `finishedAt` on table `TryoutAttempt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserAnswer";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisciplinaryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DisciplinaryRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TryoutAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scoreTwk" INTEGER NOT NULL DEFAULT 0,
    "scoreTiu" INTEGER NOT NULL DEFAULT 0,
    "scoreTkp" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "packageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "answers" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME NOT NULL,
    CONSTRAINT "TryoutAttempt_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TryoutPackage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TryoutAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TryoutAttempt" ("finishedAt", "id", "packageId", "startedAt", "totalScore", "userId") SELECT "finishedAt", "id", "packageId", "startedAt", "totalScore", "userId" FROM "TryoutAttempt";
DROP TABLE "TryoutAttempt";
ALTER TABLE "new_TryoutAttempt" RENAME TO "TryoutAttempt";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CADET',
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "rank" TEXT NOT NULL DEFAULT 'Kadet Pratama (Tingkat I)',
    "jarStats" INTEGER NOT NULL DEFAULT 0,
    "latStats" INTEGER NOT NULL DEFAULT 0,
    "suhStats" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "suhStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "gender", "id", "image", "jarStats", "latStats", "level", "name", "password", "rank", "referralCode", "referredBy", "role", "suhStats", "updatedAt", "walletBalance", "xp") SELECT "createdAt", "email", "gender", "id", "image", "jarStats", "latStats", "level", "name", "password", "rank", "referralCode", "referredBy", "role", "suhStats", "updatedAt", "walletBalance", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");
