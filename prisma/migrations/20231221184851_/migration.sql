-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "isHabit" BOOLEAN NOT NULL,
    "freq" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL
);
