-- AlterTable: amenities + working_hours on entities
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "working_hours" JSONB;

-- CreateEnum for room type kind
DO $$ BEGIN
  CREATE TYPE "room_type_kind" AS ENUM ('ROOM', 'TABLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable room_types
CREATE TABLE IF NOT EXISTS "room_types" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "kind" "room_type_kind" NOT NULL DEFAULT 'ROOM',
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_per_night" DECIMAL(10,2),

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "room_types_entity_id_idx" ON "room_types"("entity_id");
ALTER TABLE "room_types" DROP CONSTRAINT IF EXISTS "room_types_entity_id_fkey";
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable entity_images
CREATE TABLE IF NOT EXISTS "entity_images" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "caption" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "entity_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "entity_images_entity_id_idx" ON "entity_images"("entity_id");
ALTER TABLE "entity_images" DROP CONSTRAINT IF EXISTS "entity_images_entity_id_fkey";
ALTER TABLE "entity_images" ADD CONSTRAINT "entity_images_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable notification_templates
CREATE TABLE IF NOT EXISTS "notification_templates" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body_html" TEXT NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_templates_key_key" ON "notification_templates"("key");
