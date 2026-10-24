CREATE TABLE "authCredentials" (
 "email" TEXT PRIMARY KEY, "passwordHash" TEXT, "verified" BIGINT NOT NULL DEFAULT 0,
 "created" TEXT NOT NULL, CHECK ("verified" IN (0,1))
);
CREATE TABLE "authSessions" (
 "tokenHash" TEXT PRIMARY KEY, "email" TEXT NOT NULL REFERENCES "authCredentials"("email") ON DELETE CASCADE,
 "expires" TEXT NOT NULL, "created" TEXT NOT NULL
);
CREATE INDEX "idx_sessions_email" ON "authSessions"("email");
CREATE INDEX "idx_sessions_expires" ON "authSessions"("expires");
CREATE TABLE "authRecovery" ("tokenHash" TEXT PRIMARY KEY,"email" TEXT NOT NULL,"expires" TEXT NOT NULL,"created" TEXT NOT NULL);
CREATE INDEX "idx_recovery_email" ON "authRecovery"("email");
CREATE TABLE "authRateLimits" ("id" TEXT PRIMARY KEY,"count" BIGINT NOT NULL,"expires" TEXT NOT NULL);
CREATE INDEX "idx_limits_expires" ON "authRateLimits"("expires");
-- Durable outbox makes DB metadata removal transactional and object deletion retryable.
CREATE TABLE "storageDeletions" ("key" TEXT PRIMARY KEY,"created" TEXT NOT NULL,"attempts" BIGINT NOT NULL DEFAULT 0);
