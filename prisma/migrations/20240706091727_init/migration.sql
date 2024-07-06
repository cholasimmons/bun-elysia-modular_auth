-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "logs";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateEnum
CREATE TYPE "users"."Role" AS ENUM ('GUEST', 'SUPPORT', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "users"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "users"."DocumentType" AS ENUM ('NRC', 'PASSPORT');

-- CreateTable
CREATE TABLE "users"."users" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "google_id" TEXT,
    "apple_id" TEXT,
    "microsoft_id" TEXT,
    "facebook_id" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "roles" "users"."Role"[] DEFAULT ARRAY['GUEST']::"users"."Role"[],
    "profileId" TEXT,
    "hashed_password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fresh" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "host" TEXT NOT NULL,
    "user_agent_hash" TEXT,
    "os" TEXT,
    "ip_country" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."email_verification_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."profiles" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "userId" TEXT,
    "document_id" TEXT NOT NULL,
    "document_type" "users"."DocumentType" NOT NULL,
    "photoId" TEXT,
    "gender" "users"."Gender" NOT NULL DEFAULT 'OTHER',
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "supportLevel" SMALLINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."auto_enrols" (
    "id" SERIAL NOT NULL,
    "names" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "roles" "users"."Role"[],
    "supportLevel" SMALLINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_enrols_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"."users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"."users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_key" ON "users"."users"("apple_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_microsoft_id_key" ON "users"."users"("microsoft_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_id_key" ON "users"."users"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_profileId_key" ON "users"."users"("profileId");

-- CreateIndex
CREATE INDEX "users_id_email_created_at_idx" ON "users"."users"("id", "email", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_id_key" ON "users"."sessions"("id");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "users"."sessions"("user_id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_codes_id_key" ON "users"."email_verification_codes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_codes_user_id_key" ON "users"."email_verification_codes"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_codes_id_code_idx" ON "users"."email_verification_codes"("id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_id_key" ON "users"."password_reset_tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "users"."password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_id_idx" ON "users"."password_reset_tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_id_key" ON "users"."profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "users"."profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "users"."profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_phone_key" ON "users"."profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "auto_enrols_email_key" ON "users"."auto_enrols"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auto_enrols_phone_key" ON "users"."auto_enrols"("phone");

-- AddForeignKey
ALTER TABLE "users"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
