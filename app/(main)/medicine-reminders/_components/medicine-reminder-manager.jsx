"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useReminderNotifications from "./use-reminder-notifications";
import MedicineReminderForm from "./medicine-reminder-form";
import MedicineList from "./medicine-list";
import { getMedicineReminders, markMedicineAsTaken } from "@/actions/medicine-reminder";

export default function MedicineReminderManager() {
  const [reminders, setReminders] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch medicine reminders
  const fetchReminders = async () => {
    try {
      const result = await getMedicineReminders();
      if (result.success) {
        setReminders(result.data);
      } else {
        toast.error(result.error || "Failed to fetch reminders");
      }
    } catch (error) {
      toast.error("Failed to load medicine reminders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Handle marking medicine as taken
  const handleMarkAsTaken = async (reminderId) => {
    try {
      const result = await markMedicineAsTaken(reminderId);
      if (result.success) {
        toast.success("Medicine marked as taken");
        await fetchReminders();
      } else {
        toast.error(result.error || "Failed to mark medicine as taken");
      }
    } catch (error) {
      toast.error("Failed to update medicine status");
    }
  };

  // Initialize reminder notifications
  useReminderNotifications(reminders, handleMarkAsTaken);

  // Handle reminder updates
  const handleReminderAdded = async () => {
    setIsAddDialogOpen(false);
    await fetchReminders();
    toast.success("Medicine reminder added successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add New Medicine
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8">
          <div className="flex justify-center">Loading...</div>
        </Card>
      ) : (
        <MedicineList 
          reminders={reminders} 
          onUpdate={fetchReminders}
        />
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medicine Reminder</DialogTitle>
          </DialogHeader>
          <MedicineReminderForm
            onSuccess={handleReminderAdded}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}