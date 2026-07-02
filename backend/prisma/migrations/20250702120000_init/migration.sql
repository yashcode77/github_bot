-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('ADD_LABEL', 'ADD_COMMENT', 'SLACK_NOTIFY');

-- CreateEnum
CREATE TYPE "AiPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "githubLogin" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "encryptedToken" TEXT NOT NULL,
    "tokenIv" TEXT NOT NULL,
    "slackWebhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubRepoId" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "webhookId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMP(3),

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "eventType" TEXT NOT NULL,
    "eventAction" TEXT,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubEvent" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "action" TEXT,
    "githubSender" TEXT,
    "payload" JSONB NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "processingStartedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "aiSummary" TEXT,
    "aiPriority" "AiPriority",
    "aiSuggestedLabel" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleMatch" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotAction" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ruleMatchId" TEXT,
    "repositoryId" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BotAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE INDEX "User_githubLogin_idx" ON "User"("githubLogin");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubRepoId_key" ON "Repository"("githubRepoId");

-- CreateIndex
CREATE INDEX "Repository_userId_isActive_idx" ON "Repository"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_userId_owner_name_key" ON "Repository"("userId", "owner", "name");

-- CreateIndex
CREATE INDEX "Rule_repositoryId_isEnabled_eventType_idx" ON "Rule"("repositoryId", "isEnabled", "eventType");

-- CreateIndex
CREATE INDEX "Rule_repositoryId_deletedAt_idx" ON "Rule"("repositoryId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubEvent_deliveryId_key" ON "GitHubEvent"("deliveryId");

-- CreateIndex
CREATE INDEX "GitHubEvent_repositoryId_eventType_idx" ON "GitHubEvent"("repositoryId", "eventType");

-- CreateIndex
CREATE INDEX "GitHubEvent_repositoryId_receivedAt_idx" ON "GitHubEvent"("repositoryId", "receivedAt" DESC);

-- CreateIndex
CREATE INDEX "GitHubEvent_status_idx" ON "GitHubEvent"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RuleMatch_eventId_ruleId_key" ON "RuleMatch"("eventId", "ruleId");

-- CreateIndex
CREATE INDEX "BotAction_repositoryId_createdAt_idx" ON "BotAction"("repositoryId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BotAction_status_idx" ON "BotAction"("status");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubEvent" ADD CONSTRAINT "GitHubEvent_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleMatch" ADD CONSTRAINT "RuleMatch_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GitHubEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleMatch" ADD CONSTRAINT "RuleMatch_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotAction" ADD CONSTRAINT "BotAction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GitHubEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotAction" ADD CONSTRAINT "BotAction_ruleMatchId_fkey" FOREIGN KEY ("ruleMatchId") REFERENCES "RuleMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotAction" ADD CONSTRAINT "BotAction_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
