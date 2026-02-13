/*
  Warnings:

  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DailyLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DailyTarget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhysicalAssessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhysicalProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpeedDrillSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudyPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserMission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalletTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `issuedAt` on the `DisciplinaryRecord` table. All the data in the column will be lost.
  - You are about to drop the column `contentUrl` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `isPremium` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `minLevel` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `physicalScore` on the `PhysicalLog` table. All the data in the column will be lost.
  - You are about to drop the column `pullUps` on the `PhysicalLog` table. All the data in the column will be lost.
  - You are about to drop the column `pushUps` on the `PhysicalLog` table. All the data in the column will be lost.
  - You are about to drop the column `runDistance` on the `PhysicalLog` table. All the data in the column will be lost.
  - You are about to drop the column `shuttleRunSec` on the `PhysicalLog` table. All the data in the column will be lost.
  - You are about to drop the column `sitUps` on the `PhysicalLog` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `passed` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTiu` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTkp` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTwk` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `totalScore` on the `TryoutAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `jarStats` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `latStats` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suhStreak` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `DisciplinaryRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lariMeter` to the `PhysicalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pullUp` to the `PhysicalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pushUp` to the `PhysicalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shuttleRun` to the `PhysicalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sitUp` to the `PhysicalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalScore` to the `PhysicalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PhysicalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `options` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TryoutAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Achievement_code_key";

-- DropIndex
DROP INDEX "PhysicalProfile_userId_key";

-- DropIndex
DROP INDEX "UserMission_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Achievement";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyLog";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyTarget";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Notification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Option";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PhysicalAssessment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PhysicalProfile";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Purchase";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SpeedDrillSession";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudyPlan";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserAchievement";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserMission";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WalletTransaction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PsychologyPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "category" TEXT NOT NULL,
    "description" TEXT,
    "config" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PsychologyQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "image" TEXT,
    "options" TEXT NOT NULL,
    "explanation" TEXT,
    "packageId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PsychologyQuestion_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PsychologyPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PsychologyAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "answers" TEXT,
    "columnHistory" TEXT,
    "totalMistakes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PsychologyAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PsychologyAttempt_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PsychologyPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyMission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrillUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitNumber" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 120,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DrillHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "drillUnitId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrillHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DrillHistory_drillUnitId_fkey" FOREIGN KEY ("drillUnitId") REFERENCES "DrillUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekId" TEXT,
    "diagnosis" TEXT,
    "focusAreas" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "uniqueCode" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'MANUAL_TRANSFER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DisciplinaryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DisciplinaryRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DisciplinaryRecord" ("id", "isResolved", "reason", "type", "userId") SELECT "id", "isResolved", "reason", "type", "userId" FROM "DisciplinaryRecord";
DROP TABLE "DisciplinaryRecord";
ALTER TABLE "new_DisciplinaryRecord" RENAME TO "DisciplinaryRecord";
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Material" ("category", "createdAt", "description", "id", "title", "type") SELECT "category", "createdAt", "description", "id", "title", "type" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE TABLE "new_PhysicalLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lariMeter" INTEGER NOT NULL,
    "pushUp" INTEGER NOT NULL,
    "sitUp" INTEGER NOT NULL,
    "pullUp" INTEGER NOT NULL,
    "shuttleRun" REAL NOT NULL,
    "totalScore" REAL NOT NULL,
    "aiFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PhysicalLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PhysicalLog" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "PhysicalLog";
DROP TABLE "PhysicalLog";
ALTER TABLE "new_PhysicalLog" RENAME TO "PhysicalLog";
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "image" TEXT,
    "svgCode" TEXT,
    "options" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TWK',
    "subCategory" TEXT,
    "packageId" TEXT,
    "drillUnitId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TryoutPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Question_drillUnitId_fkey" FOREIGN KEY ("drillUnitId") REFERENCES "DrillUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("createdAt", "explanation", "id", "image", "packageId", "text", "type") SELECT "createdAt", "explanation", "id", "image", "packageId", "text", "type" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE TABLE "new_TryoutAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "answers" TEXT NOT NULL,
    "analysis" TEXT,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TryoutAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TryoutAttempt_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TryoutPackage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TryoutAttempt" ("answers", "finishedAt", "id", "packageId", "startedAt", "userId") SELECT "answers", "finishedAt", "id", "packageId", "startedAt", "userId" FROM "TryoutAttempt";
DROP TABLE "TryoutAttempt";
ALTER TABLE "new_TryoutAttempt" RENAME TO "TryoutAttempt";
CREATE INDEX "TryoutAttempt_userId_idx" ON "TryoutAttempt"("userId");
CREATE INDEX "TryoutAttempt_packageId_idx" ON "TryoutAttempt"("packageId");
CREATE TABLE "new_TryoutPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 100,
    "type" TEXT NOT NULL DEFAULT 'UMUM',
    "category" TEXT NOT NULL DEFAULT 'SKD',
    "price" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TryoutPackage" ("category", "createdAt", "description", "duration", "id", "isPublished", "price", "title", "updatedAt") SELECT "category", "createdAt", "description", "duration", "id", "isPublished", "price", "title", "updatedAt" FROM "TryoutPackage";
DROP TABLE "TryoutPackage";
ALTER TABLE "new_TryoutPackage" RENAME TO "TryoutPackage";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CADET',
    "referredBy" TEXT,
    "referralCode" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "rank" TEXT NOT NULL DEFAULT 'CALON PRAJA',
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "suhStats" INTEGER NOT NULL DEFAULT 100,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
    "subscriptionExpires" DATETIME,
    "hasSeenOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "hasCompletedScreening" BOOLEAN NOT NULL DEFAULT false,
    "initialRunDistance" INTEGER,
    "initialPushup" INTEGER,
    "initialSitup" INTEGER,
    "initialPullup" INTEGER,
    "initialTwkScore" INTEGER,
    "initialTiuScore" INTEGER,
    "initialTkpScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "level", "name", "password", "rank", "referralCode", "referredBy", "role", "suhStats", "updatedAt", "walletBalance", "xp") SELECT "createdAt", "email", "id", "level", "name", "password", "rank", "referralCode", "referredBy", "role", "suhStats", "updatedAt", "walletBalance", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DailyMission_userId_idx" ON "DailyMission"("userId");

-- CreateIndex
CREATE INDEX "DrillHistory_userId_idx" ON "DrillHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPlan_userId_weekNumber_key" ON "WeeklyPlan"("userId", "weekNumber");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
