-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wokeUpOnTime" BOOLEAN NOT NULL DEFAULT false,
    "worshipDone" BOOLEAN NOT NULL DEFAULT false,
    "bedMade" BOOLEAN NOT NULL DEFAULT false,
    "targetFisik" TEXT,
    "targetAkademik" TEXT,
    "fisikDone" BOOLEAN NOT NULL DEFAULT false,
    "akademikDone" BOOLEAN NOT NULL DEFAULT false,
    "evidenceUrl" TEXT,
    "verificationNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "debtFromYesterday" TEXT,
    "isDebtPaid" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DailyLog" ("akademikDone", "bedMade", "date", "debtFromYesterday", "fisikDone", "id", "isDebtPaid", "targetAkademik", "targetFisik", "userId", "wokeUpOnTime", "worshipDone") SELECT "akademikDone", "bedMade", "date", "debtFromYesterday", "fisikDone", "id", "isDebtPaid", "targetAkademik", "targetFisik", "userId", "wokeUpOnTime", "worshipDone" FROM "DailyLog";
DROP TABLE "DailyLog";
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
