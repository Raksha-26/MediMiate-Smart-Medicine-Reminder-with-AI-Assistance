"use server";

import { db as prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Mark a medicine reminder as missed
export async function markMedicineAsMissed(reminderId) {
  try {
    const reminder = await prisma.medicineReminder.update({
      where: { id: reminderId },
      data: { status: "MISSED" },
    });

    revalidatePath("/medicine-reminders");
    return { success: true, data: reminder };
  } catch (error) {
    console.error("Error marking medicine as missed:", error);
    return { success: false, error: error.message };
  }
}

// Add a new medicine reminder
export async function addMedicineReminder(data) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PATIENT") {
      throw new Error("Only patients can add medicine reminders");
    }

    const reminder = await prisma.medicineReminder.create({
      data: {
        patientId: user.id,
        medicineName: data.medicineName,
        dosage: data.dosage,
        frequency: data.frequency,
        days: data.frequency === "SPECIFIC_DAYS" ? data.days : [],
        timeToTake: data.timeToTake,
        alternateCaregiverNumber: data.alternateCaregiverNumber,
      },
    });

    revalidatePath("/medicine-reminders");
    return { success: true, data: reminder };
  } catch (error) {
    console.error("Error adding medicine reminder:", error);
    return { success: false, error: error.message };
  }
}

// Get all medicine reminders for the current patient
export async function getMedicineReminders() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PATIENT") {
      throw new Error("Only patients can view medicine reminders");
    }

    const reminders = await prisma.medicineReminder.findMany({
      where: { patientId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: reminders };
  } catch (error) {
    console.error("Error getting medicine reminders:", error);
    return { success: false, error: error.message };
  }
}

// Mark a medicine as taken
export async function markMedicineAsTaken(reminderId) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PATIENT") {
      throw new Error("Only patients can mark medicines as taken");
    }

    const reminder = await prisma.medicineReminder.update({
      where: { 
        id: reminderId,
        patientId: user.id, // Ensure the reminder belongs to the patient
      },
      data: {
        status: "TAKEN",
        lastTakenAt: new Date(),
      },
    });

    revalidatePath("/medicine-reminders");
    return { success: true, data: reminder };
  } catch (error) {
    console.error("Error marking medicine as taken:", error);
    return { success: false, error: error.message };
  }
}

// Delete a medicine reminder
export async function deleteMedicineReminder(reminderId) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PATIENT") {
      throw new Error("Only patients can delete medicine reminders");
    }

    await prisma.medicineReminder.delete({
      where: { 
        id: reminderId,
        patientId: user.id, // Ensure the reminder belongs to the patient
      },
    });

    revalidatePath("/medicine-reminders");
    return { success: true };
  } catch (error) {
    console.error("Error deleting medicine reminder:", error);
    return { success: false, error: error.message };
  }
}

// Check for missed medicines and update their status
// Edit a medicine reminder
export async function editMedicineReminder(reminderId, data) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PATIENT") {
      throw new Error("Only patients can edit medicine reminders");
    }

    const reminder = await prisma.medicineReminder.update({
      where: { 
        id: reminderId,
        patientId: user.id, // Ensure the reminder belongs to the patient
      },
      data: {
        medicineName: data.medicineName,
        dosage: data.dosage,
        frequency: data.frequency,
        days: data.frequency === "SPECIFIC_DAYS" ? data.days : [],
        timeToTake: data.timeToTake,
        alternateCaregiverNumber: data.alternateCaregiverNumber,
      },
    });

    revalidatePath("/medicine-reminders");
    return { success: true, data: reminder };
  } catch (error) {
    console.error("Error editing medicine reminder:", error);
    return { success: false, error: error.message };
  }
}

export async function checkMissedMedicines() {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Find all pending reminders that should have been taken more than 2 hours ago
    const missedReminders = await prisma.medicineReminder.findMany({
      where: {
        status: "PENDING",
        timeToTake: {
          some: {
            lt: twoHoursAgo
          }
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

    // Update status to MISSED and send notifications
    for (const reminder of missedReminders) {
      await prisma.medicineReminder.update({
        where: { id: reminder.id },
        data: { status: "MISSED" }
      });

      // TODO: Implement SMS notification to caregiver
      // You'll need to implement the actual SMS sending logic here
      // using a service like Twilio
      console.log(`Sending notification to ${reminder.alternateCaregiverNumber} for patient ${reminder.patient.name}'s missed medicine ${reminder.medicineName}`);
    }

    return { success: true, missedCount: missedReminders.length };
  } catch (error) {
    console.error("Error checking missed medicines:", error);
    return { success: false, error: error.message };
  }
}