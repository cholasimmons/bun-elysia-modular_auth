-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "files";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "finance";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "logs";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "messages";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notifications";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateEnum
CREATE TYPE "files"."FileStatus" AS ENUM ('UPLOAD_FAILED', 'UPLOADED', 'MISSING_IN_STORAGE', 'ORPHANED');

-- CreateEnum
CREATE TYPE "finance"."TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "finance"."Currency" AS ENUM ('ZMW', 'USD', 'GBP', 'ZAR');

-- CreateEnum
CREATE TYPE "finance"."DiscountType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "messages"."MessagePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "messages"."MessageDelivery" AS ENUM ('INTERNAL', 'NOTIFICATION', 'EMAIL', 'SMS');

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
    "key" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploader_user_id" TEXT NOT NULL,
    "status" "files"."FileStatus" NOT NULL DEFAULT 'UPLOAD_FAILED',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "tags" TEXT[],
    "hash" TEXT,
    "comment" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."wallets" (
    "id" TEXT NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "balance" MONEY NOT NULL DEFAULT 0.00,
    "currency" "finance"."Currency" NOT NULL DEFAULT 'ZMW',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."wallet_transactions" (
    "id" TEXT NOT NULL,
    "amount" MONEY NOT NULL,
    "discount" MONEY NOT NULL,
    "discount_code" TEXT,
    "transaction_fee" MONEY NOT NULL,
    "reference" VARCHAR(64),
    "payer_id" TEXT NOT NULL,
    "payee_id" TEXT NOT NULL,
    "currency" "finance"."Currency" NOT NULL,
    "status" "finance"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "longitude" DECIMAL(9,6),
    "latitude" DECIMAL(9,6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs"."wallet_transactions_logs" (
    "id" SERIAL NOT NULL,
    "payer_id" TEXT NOT NULL,
    "payer_names" TEXT NOT NULL,
    "payer_national_id" TEXT NOT NULL,
    "payer_national_id_type" TEXT NOT NULL,
    "payee_id" TEXT NOT NULL,
    "payee_national_id" TEXT NOT NULL,
    "payee_national_id_type" TEXT NOT NULL,
    "payee_names" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL,
    "disocunt_code" TEXT,
    "transaction_fee" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "longitude" DECIMAL(9,6),
    "latitude" DECIMAL(9,6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "discount_type" "finance"."DiscountType" NOT NULL DEFAULT 'FLAT',
    "expires_at" TIMESTAMPTZ(6),
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "owner_profile_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs"."coupon_logs" (
    "id" SERIAL NOT NULL,
    "coupon_code" TEXT NOT NULL,
    "coupon_name" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "discount_type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "times_used" INTEGER NOT NULL,
    "max_uses" INTEGER NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "user_names" TEXT NOT NULL,
    "used_for" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages"."messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "recipientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "messages"."MessagePriority" NOT NULL DEFAULT 'LOW',
    "deliveryMethods" "messages"."MessageDelivery"[] DEFAULT ARRAY['INTERNAL']::"messages"."MessageDelivery"[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications"."connections" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
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
    "prefs" JSONB,

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
    "x_client_type" TEXT,
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
    "photo" TEXT,
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

-- CreateTable
CREATE TABLE "finance"."_user_used_coupons" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_user_used_coupons_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_uploads_id_key" ON "files"."file_uploads"("id");

-- CreateIndex
CREATE INDEX "file_uploads_file_name_bucket_uploader_user_id_created_at_idx" ON "files"."file_uploads"("file_name", "bucket", "uploader_user_id", "created_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_id_key" ON "finance"."wallets"("id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_profile_id_key" ON "finance"."wallets"("user_profile_id");

-- CreateIndex
CREATE INDEX "wallets_user_profile_id_idx" ON "finance"."wallets"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_id_key" ON "finance"."wallet_transactions"("id");

-- CreateIndex
CREATE INDEX "wallet_transactions_created_at_payer_id_payee_id_idx" ON "finance"."wallet_transactions"("created_at" DESC, "payer_id", "payee_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_logs_id_key" ON "logs"."wallet_transactions_logs"("id");

-- CreateIndex
CREATE INDEX "wallet_transactions_logs_timestamp_created_at_payer_id_paye_idx" ON "logs"."wallet_transactions_logs"("timestamp" DESC, "created_at" DESC, "payer_id", "payee_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_id_key" ON "finance"."coupons"("id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "finance"."coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_owner_profile_id_idx" ON "finance"."coupons"("code", "owner_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_logs_id_key" ON "logs"."coupon_logs"("id");

-- CreateIndex
CREATE INDEX "coupon_logs_coupon_code_timestamp_created_at_idx" ON "logs"."coupon_logs"("coupon_code", "timestamp" DESC, "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_id_senderId_created_at_idx" ON "messages"."messages"("id", "senderId", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "connections_user_id_key" ON "notifications"."connections"("user_id");

-- CreateIndex
CREATE INDEX "connections_user_id_idx" ON "notifications"."connections"("user_id" DESC);

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

-- CreateIndex
CREATE INDEX "_user_used_coupons_B_index" ON "finance"."_user_used_coupons"("B");

-- AddForeignKey
ALTER TABLE "finance"."wallets" ADD CONSTRAINT "wallets_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "users"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."wallet_transactions" ADD CONSTRAINT "wallet_transactions_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "finance"."wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."oauth" ADD CONSTRAINT "oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."profiles" ADD CONSTRAINT "profiles_subscriptionType_fkey" FOREIGN KEY ("subscriptionType") REFERENCES "users"."subscriptions"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."_user_used_coupons" ADD CONSTRAINT "_user_used_coupons_A_fkey" FOREIGN KEY ("A") REFERENCES "finance"."coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."_user_used_coupons" ADD CONSTRAINT "_user_used_coupons_B_fkey" FOREIGN KEY ("B") REFERENCES "users"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
