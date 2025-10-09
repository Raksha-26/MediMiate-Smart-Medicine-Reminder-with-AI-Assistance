/*
  Warnings:

  - You are about to drop the column `availabilityId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Availability` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_availabilityId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "availabilityId";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "day";
