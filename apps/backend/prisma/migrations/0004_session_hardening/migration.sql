-- Correct the original session table contract without changing applied history.
ALTER TABLE "web_sessions" ALTER COLUMN "sid" TYPE VARCHAR(255);
ALTER INDEX "wen_sessions_expire_idx" RENAME TO "web_sessions_expire_idx";

CREATE TABLE "auth_rate_limits" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "hits" INTEGER NOT NULL DEFAULT 1,
  "expires_at" TIMESTAMP(6) NOT NULL
);
CREATE INDEX "auth_rate_limits_expires_at_idx" ON "auth_rate_limits" ("expires_at");
