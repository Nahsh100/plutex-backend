-- AlterEnum
ALTER TYPE "public"."VendorStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."vendors" ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "idType" TEXT,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;
