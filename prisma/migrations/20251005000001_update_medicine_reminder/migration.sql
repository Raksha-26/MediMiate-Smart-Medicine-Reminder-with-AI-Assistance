-- CreateEnum
CREATE TYPE "MedicineFrequency" AS ENUM ('DAILY', 'SPECIFIC_DAYS');

-- AlterTable
ALTER TABLE "MedicineReminder" 
ADD COLUMN "days" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "frequency" TYPE "MedicineFrequency" USING 'DAILY'::"MedicineFrequency",
ALTER COLUMN "frequency" SET DEFAULT 'DAILY';