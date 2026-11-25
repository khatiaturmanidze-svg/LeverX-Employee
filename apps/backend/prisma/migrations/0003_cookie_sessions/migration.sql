ALTER TABLE "auth_users"
ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE
    "web_sessions" (
        "sid" VARCHAR(225) NOT NULL,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL,
        CONSTRAINT "web_sessions_pkey" PRIMARY KEY ("sid")
    );

CREATE INDEX "wen_sessions_expire_idx" ON "web_sessions" ("expire");