/*
  Warnings:

  - You are about to drop the column `duration` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `freq` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isHabit` on the `Event` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("endTime", "id", "name", "startTime") SELECT "endTime", "id", "name", "startTime" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
