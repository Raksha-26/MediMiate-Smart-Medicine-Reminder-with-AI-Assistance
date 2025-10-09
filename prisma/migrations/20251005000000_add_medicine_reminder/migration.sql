-- CreateEnum
CREATE TYPE "MedicineStatus" AS ENUM ('PENDING', 'TAKEN', 'MISSED');

-- CreateTable
CREATE TABLE "MedicineReminder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "timeToTake" TIMESTAMP(3)[] NOT NULL,
    "alternateCaregiverNumber" TEXT NOT NULL,
    "status" "MedicineStatus" NOT NULL DEFAULT 'PENDING',
    "lastTakenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicineReminder_patientId_idx" ON "MedicineReminder"("patientId");

-- AddForeignKey
ALTER TABLE "MedicineReminder" ADD CONSTRAINT "MedicineReminder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;