-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "files";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "logs";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateEnum
CREATE TYPE "files"."FileStatus" AS ENUM ('UPLOAD_FAILED', 'UPLOADED', 'MISSING_IN_STORAGE', 'ORPHANED');

-- CreateEnum
CREATE TYPE "users"."Role" AS ENUM ('GUEST', 'SUPPORT', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "users"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "users"."DocumentType" AS ENUM ('NRC', 'PASSPORT');

-- CreateEnum
CREATE TYPE "users"."SubscriptionType" AS ENUM ('FREE', 'PREMIUM', 'ELITE');

-- CreateTable
CREATE TABLE "files"."file_uploads" (
    "id" TEXT NOT NULL,
    "orig_file_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT,
    "file_size" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "status" "files"."FileStatus" NOT NULL DEFAULT 'UPLOAD_FAILED',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."oauth" (
    "provider_id" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "oauth_pkey" PRIMARY KEY ("provider_id")
);

-- CreateTable
CREATE TABLE "users"."users" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "roles" "users"."Role"[] DEFAULT ARRAY['GUEST']::"users"."Role"[],
    "hashed_password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fresh" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "device_identifier" TEXT NOT NULL,
    "authentication_method" TEXT NOT NULL,
    "os" TEXT,
    "ip_addr" TEXT NOT NULL,
    "ip_country" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "user_id" TEXT,
    "document_id" TEXT NOT NULL,
    "document_type" "users"."DocumentType" NOT NULL,
    "photoId" TEXT,
    "gender" "users"."Gender" NOT NULL DEFAULT 'OTHER',
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "supportLevel" SMALLINT NOT NULL DEFAULT 0,
    "subscriptionType" "users"."SubscriptionType" NOT NULL,
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

-- CreateTable
CREATE TABLE "users"."subscriptions" (
    "id" TEXT NOT NULL,
    "name" "users"."SubscriptionType" NOT NULL,
    "price" MONEY NOT NULL,
    "features" TEXT[],

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_uploads_id_key" ON "files"."file_uploads"("id");

-- CreateIndex
CREATE INDEX "file_uploads_file_name_bucket_user_profile_id_created_at_idx" ON "files"."file_uploads"("file_name", "bucket", "user_profile_id", "created_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_provider_id_key" ON "users"."oauth"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_provider_user_id_key" ON "users"."oauth"("provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_user_id_key" ON "users"."oauth"("user_id");

-- CreateIndex
CREATE INDEX "oauth_provider_id_provider_user_id_idx" ON "users"."oauth"("provider_id", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"."users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"."users"("username");

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
CREATE UNIQUE INDEX "profiles_user_id_key" ON "users"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "users"."profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_phone_key" ON "users"."profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "auto_enrols_email_key" ON "users"."auto_enrols"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auto_enrols_phone_key" ON "users"."auto_enrols"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_name_key" ON "users"."subscriptions"("name");

-- AddForeignKey
ALTER TABLE "users"."oauth" ADD CONSTRAINT "oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."profiles" ADD CONSTRAINT "profiles_subscriptionType_fkey" FOREIGN KEY ("subscriptionType") REFERENCES "users"."subscriptions"("name") ON DELETE RESTRICT ON UPDATE CASCADE;