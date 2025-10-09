"use client";

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { markMedicineAsMissed } from '@/actions/medicine-reminder';
import { notifyCaregiverOfMissedMedicines } from '@/actions/notifications';

export default function useReminderNotifications(reminders, handleMarkAsTaken) {
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Load alarm sound
    let audio = null;
    try {
      audio = new Audio("/alarm-sound.mp3");
      audio.loop = true;
      // Preload the audio
      audio.load();
    } catch (error) {
      console.error("Error loading alarm sound:", error);
    }

    // Check for medicine times
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      reminders.forEach(reminder => {
        if (reminder.status === "PENDING") {
          reminder.timeToTake.forEach(timeStr => {
            const reminderTime = new Date(timeStr);
            const now = new Date();

            // Create today's date with the reminder time
            const todayWithReminderTime = new Date();
            todayWithReminderTime.setHours(reminderTime.getHours());
            todayWithReminderTime.setMinutes(reminderTime.getMinutes());
            todayWithReminderTime.setSeconds(0);
            todayWithReminderTime.setMilliseconds(0);
            
            const timeDiff = now - todayWithReminderTime;
            
            // Format time for display
            const reminderTimeFormatted = todayWithReminderTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });

            // Check if medicine should be marked as missed (2 hours passed)
            if (timeDiff > 2 * 60 * 60 * 1000 && timeDiff < 24 * 60 * 60 * 1000) {
              // Update the status to MISSED in the database and handle notifications
              markMedicineAsMissed(reminder.id).then(() => {
                notifyCaregiverOfMissedMedicines(reminder.patientId).then((notificationResult) => {
                  if (notificationResult.success && notificationResult.medicinesCount >= 2) {
                    toast.info(
                      "Caregiver Notified",
                      {
                        description: `Caregiver has been notified about ${notificationResult.medicinesCount} missed medicines today.`,
                        duration: 5000,
                      }
                    );
                  }
                });
                
                toast.error(
                  `Missed Medicine: ${reminder.medicineName}`,
                  {
                    description: `You missed your ${reminder.dosage} dose scheduled for ${reminderTimeFormatted}`,
                    duration: 10000,
                  }
                );
              });
              return; // Skip showing reminder for missed medicine
            }

            if (currentTime === reminderTimeFormatted) {
              // Show browser notification
              if (Notification.permission === "granted") {
                new Notification("Medicine Reminder", {
                  body: `Time to take ${reminder.medicineName} - ${reminder.dosage}`,
                  icon: "/logo-single.png", // Use your app's logo
                });
              }

              // Show toast notification
              toast.info(
                `Time to take ${reminder.medicineName}`,
                {
                  description: `Dosage: ${reminder.dosage}`,
                  duration: 60000, // 1 minute
                  action: {
                    label: "Mark as Taken",
                    onClick: () => handleMarkAsTaken(reminder.id)
                  }
                }
              );

              // Play alarm sound for 1 minute
              if (audio) {
                try {
                  // Ensure audio is ready to play
                  audio.currentTime = 0;
                  // Create a promise to play the sound
                  const playPromise = audio.play();

                  if (playPromise !== undefined) {
                    playPromise
                      .then(() => {
                        // Set a timeout to stop the sound after 1 minute
                        setTimeout(() => {
                          audio.pause();
                          audio.currentTime = 0;
                        }, 60000);
                      })
                      .catch(error => {
                        console.error("Error playing alarm sound:", error);
                      });
                  }
                } catch (error) {
                  console.error("Error playing alarm sound:", error);
                }
              }
            }
          });
        }
      });
    };

    // Check every minute
    const intervalId = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately on mount

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [reminders]);
}