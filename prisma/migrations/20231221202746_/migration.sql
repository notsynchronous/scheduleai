-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Event" ("endTime", "eventId", "id", "name", "startTime") SELECT "endTime", "eventId", "id", "name", "startTime" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
