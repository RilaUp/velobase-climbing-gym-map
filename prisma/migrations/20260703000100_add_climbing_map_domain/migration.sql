-- CreateEnum
CREATE TYPE "ClimbingDataSourceProvider" AS ENUM ('AMAP', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ClimbingActivityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ClimbingPartnerPostStatus" AS ENUM ('OPEN', 'MATCHED', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClimbingUserSubmissionType" AS ENUM ('GYM_PROFILE', 'RESET_SCHEDULE', 'ACTIVITY', 'ROUTE_CONDITION');

-- CreateEnum
CREATE TYPE "ClimbingPromotionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "climbing_gyms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "source_provider" "ClimbingDataSourceProvider" NOT NULL DEFAULT 'MANUAL',
    "source_external_id" TEXT,
    "description" TEXT,
    "contact" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_gyms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_gym_reset_plans" (
    "id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "area_name" TEXT NOT NULL,
    "reset_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "source_provider" "ClimbingDataSourceProvider" NOT NULL DEFAULT 'MANUAL',
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_gym_reset_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_gym_activities" (
    "id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "signup_url" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "ticket_price_cents" INTEGER,
    "capacity" INTEGER,
    "status" "ClimbingActivityStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_gym_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_route_reviews" (
    "id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "route_grade" TEXT NOT NULL,
    "style_tag" TEXT NOT NULL,
    "quality_score" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_route_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_partner_posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gym_id" TEXT,
    "city" TEXT NOT NULL,
    "preferred_grade" TEXT,
    "climbing_style" TEXT,
    "available_note" TEXT NOT NULL,
    "contact_handle" TEXT NOT NULL,
    "message" TEXT,
    "status" "ClimbingPartnerPostStatus" NOT NULL DEFAULT 'OPEN',
    "matched_user_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_partner_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_gym_user_submissions" (
    "id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ClimbingUserSubmissionType" NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_gym_user_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_gym_promotions" (
    "id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "slot_type" TEXT NOT NULL DEFAULT 'TOP_LISTING',
    "campaign_name" TEXT NOT NULL,
    "budget_cents" INTEGER,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "status" "ClimbingPromotionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_gym_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_brand_campaigns" (
    "id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "target_cities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "placement_type" TEXT NOT NULL DEFAULT 'BANNER',
    "budget_cents" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_brand_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climbing_activity_ticket_orders" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "platform_fee_cents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "external_order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climbing_activity_ticket_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "climbing_gyms_source_provider_source_external_id_key" ON "climbing_gyms"("source_provider", "source_external_id");

-- CreateIndex
CREATE INDEX "climbing_gyms_city_district_idx" ON "climbing_gyms"("city", "district");

-- CreateIndex
CREATE INDEX "climbing_gyms_latitude_longitude_idx" ON "climbing_gyms"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "climbing_gyms_created_at_idx" ON "climbing_gyms"("created_at");

-- CreateIndex
CREATE INDEX "climbing_gym_reset_plans_gym_id_reset_date_idx" ON "climbing_gym_reset_plans"("gym_id", "reset_date");

-- CreateIndex
CREATE INDEX "climbing_gym_reset_plans_created_by_id_idx" ON "climbing_gym_reset_plans"("created_by_id");

-- CreateIndex
CREATE INDEX "climbing_gym_activities_gym_id_start_at_idx" ON "climbing_gym_activities"("gym_id", "start_at");

-- CreateIndex
CREATE INDEX "climbing_gym_activities_status_start_at_idx" ON "climbing_gym_activities"("status", "start_at");

-- CreateIndex
CREATE INDEX "climbing_gym_activities_created_by_id_idx" ON "climbing_gym_activities"("created_by_id");

-- CreateIndex
CREATE INDEX "climbing_route_reviews_gym_id_created_at_idx" ON "climbing_route_reviews"("gym_id", "created_at");

-- CreateIndex
CREATE INDEX "climbing_route_reviews_user_id_created_at_idx" ON "climbing_route_reviews"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "climbing_partner_posts_city_status_created_at_idx" ON "climbing_partner_posts"("city", "status", "created_at");

-- CreateIndex
CREATE INDEX "climbing_partner_posts_gym_id_status_idx" ON "climbing_partner_posts"("gym_id", "status");

-- CreateIndex
CREATE INDEX "climbing_partner_posts_user_id_status_idx" ON "climbing_partner_posts"("user_id", "status");

-- CreateIndex
CREATE INDEX "climbing_partner_posts_expires_at_idx" ON "climbing_partner_posts"("expires_at");

-- CreateIndex
CREATE INDEX "climbing_gym_user_submissions_gym_id_type_created_at_idx" ON "climbing_gym_user_submissions"("gym_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "climbing_gym_user_submissions_user_id_created_at_idx" ON "climbing_gym_user_submissions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "climbing_gym_user_submissions_status_created_at_idx" ON "climbing_gym_user_submissions"("status", "created_at");

-- CreateIndex
CREATE INDEX "climbing_gym_promotions_gym_id_status_ends_at_idx" ON "climbing_gym_promotions"("gym_id", "status", "ends_at");

-- CreateIndex
CREATE INDEX "climbing_gym_promotions_created_by_id_idx" ON "climbing_gym_promotions"("created_by_id");

-- CreateIndex
CREATE INDEX "climbing_brand_campaigns_status_starts_at_idx" ON "climbing_brand_campaigns"("status", "starts_at");

-- CreateIndex
CREATE INDEX "climbing_activity_ticket_orders_activity_id_created_at_idx" ON "climbing_activity_ticket_orders"("activity_id", "created_at");

-- CreateIndex
CREATE INDEX "climbing_activity_ticket_orders_user_id_created_at_idx" ON "climbing_activity_ticket_orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "climbing_activity_ticket_orders_status_idx" ON "climbing_activity_ticket_orders"("status");

-- AddForeignKey
ALTER TABLE "climbing_gym_reset_plans" ADD CONSTRAINT "climbing_gym_reset_plans_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "climbing_gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_gym_reset_plans" ADD CONSTRAINT "climbing_gym_reset_plans_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_gym_activities" ADD CONSTRAINT "climbing_gym_activities_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "climbing_gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_gym_activities" ADD CONSTRAINT "climbing_gym_activities_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_route_reviews" ADD CONSTRAINT "climbing_route_reviews_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "climbing_gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_route_reviews" ADD CONSTRAINT "climbing_route_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_partner_posts" ADD CONSTRAINT "climbing_partner_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_partner_posts" ADD CONSTRAINT "climbing_partner_posts_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "climbing_gyms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_partner_posts" ADD CONSTRAINT "climbing_partner_posts_matched_user_id_fkey" FOREIGN KEY ("matched_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_gym_user_submissions" ADD CONSTRAINT "climbing_gym_user_submissions_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "climbing_gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_gym_user_submissions" ADD CONSTRAINT "climbing_gym_user_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_gym_promotions" ADD CONSTRAINT "climbing_gym_promotions_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "climbing_gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_gym_promotions" ADD CONSTRAINT "climbing_gym_promotions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_activity_ticket_orders" ADD CONSTRAINT "climbing_activity_ticket_orders_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "climbing_gym_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climbing_activity_ticket_orders" ADD CONSTRAINT "climbing_activity_ticket_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
