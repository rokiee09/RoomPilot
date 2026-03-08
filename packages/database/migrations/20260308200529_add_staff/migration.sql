-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(128) NOT NULL,
    "phone" VARCHAR(64),
    "email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_entity_id_idx" ON "staff"("entity_id");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
