-- AlterTable
ALTER TABLE "public"."app_config" ADD COLUMN     "defaultShippingRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "public"."vendors" ADD COLUMN     "freeShippingThreshold" DOUBLE PRECISION,
ADD COLUMN     "shippingNotes" TEXT,
ADD COLUMN     "shippingRate" DOUBLE PRECISION;
