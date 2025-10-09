-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "availabilityId" TEXT;

-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "day" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE SET NULL ON UPDATE CASCADE;
