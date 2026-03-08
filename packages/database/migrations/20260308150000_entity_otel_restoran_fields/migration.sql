-- AlterTable
ALTER TABLE "entities" ADD COLUMN "address" VARCHAR(512),
ADD COLUMN "phone" VARCHAR(64),
ADD COLUMN "room_count" INTEGER,
ADD COLUMN "capacity" INTEGER,
ADD COLUMN "star_rating" INTEGER,
ADD COLUMN "cuisine_type" VARCHAR(128),
ADD COLUMN "expense_info" TEXT,
ADD COLUMN "kitchen_info" TEXT;
