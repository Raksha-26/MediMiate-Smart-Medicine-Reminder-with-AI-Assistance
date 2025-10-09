"use server";

import { db as prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

export async function notifyCaregiverOfMissedMedicines(patientId) {
  try {
    console.log('Checking for missed medicines for patient:', patientId);
    // Get all missed medicines for the patient from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const missedMedicines = await prisma.medicineReminder.findMany({
      where: {
        patientId,
        status: "MISSED",
        updatedAt: {
          gte: today
        }
      },
      include: {
        patient: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('Found missed medicines:', missedMedicines);

    if (missedMedicines.length >= 2) {
      console.log('Found 2 or more missed medicines, preparing to send SMS');
      // Get unique caregiver numbers
      const caregiverNumbers = [...new Set(missedMedicines.map(m => m.alternateCaregiverNumber))];

      for (const number of caregiverNumbers) {
        const message = `Alert: ${missedMedicines[0].patient.name} has missed ${missedMedicines.length} medicines today. ` +
          `Missed medicines: ${missedMedicines.map(m => m.medicineName).join(", ")}. ` +
          `Please check on them.`;

        await sendSMS(number, message);
      }

      return { success: true, medicinesCount: missedMedicines.length };
    }

    return { success: true, medicinesCount: missedMedicines.length };
  } catch (error) {
    console.error("Error notifying caregiver:", error);
    return { success: false, error: error.message };
  }
}