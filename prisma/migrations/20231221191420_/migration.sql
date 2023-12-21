/*
  Warnings:

  - Added the required column `eventId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "eventId" TEXT NOT NULL
);
INSERT INTO "new_Event" ("endTime", "id", "name", "startTime") SELECT "endTime", "id", "name", "startTime" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
