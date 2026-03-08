-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('AVAILABLE_CLEAN', 'AVAILABLE_DIRTY', 'RESERVED', 'OCCUPIED', 'STAYOVER', 'OUT_OF_SERVICE');

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "room_type_id" TEXT NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2),
    "status" "room_status" NOT NULL DEFAULT 'AVAILABLE_CLEAN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rooms_uuid_key" ON "rooms"("uuid");

-- CreateIndex
CREATE INDEX "rooms_room_type_id_idx" ON "rooms"("room_type_id");

-- CreateIndex
CREATE INDEX "rooms_deleted_at_idx" ON "rooms"("deleted_at");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
