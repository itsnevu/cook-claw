-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "fid" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DeployEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "deploy" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'api',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeployEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_fid_key" ON "User"("fid");

-- CreateIndex
CREATE INDEX "DeployEvent_username_createdAt_idx" ON "DeployEvent"("username", "createdAt");

-- CreateIndex
CREATE INDEX "DeployEvent_createdAt_idx" ON "DeployEvent"("createdAt");
