"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteMedicineReminder, markMedicineAsTaken } from "@/actions/medicine-reminder";
import MedicineReminderForm from "./medicine-reminder-form";

export default function MedicineList({ reminders, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const handleMarkAsTaken = async (reminderId) => {
    setIsLoading(true);
    try {
      const result = await markMedicineAsTaken(reminderId);
      if (result.success) {
        toast.success("Medicine marked as taken");
        onUpdate();
      } else {
        toast.error(result.error || "Failed to mark medicine as taken");
      }
    } catch (error) {
      toast.error("Failed to update medicine status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reminderId) => {
    if (!window.confirm("Are you sure you want to delete this medicine reminder?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteMedicineReminder(reminderId);
      if (result.success) {
        toast.success("Medicine reminder deleted");
        onUpdate();
      } else {
        toast.error(result.error || "Failed to delete medicine reminder");
      }
    } catch (error) {
      toast.error("Failed to delete medicine reminder");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "TAKEN":
        return "bg-green-100 text-green-800";
      case "MISSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (reminders.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          No medicine reminders added yet
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{reminder.medicineName}</h3>
                <Badge className={getStatusColor(reminder.status)}>
                  {reminder.status}
                </Badge>
              </div>
              <p className="text-gray-600">Dosage: {reminder.dosage}</p>
              <p className="text-gray-600">Frequency: {reminder.frequency}</p>
              <div className="text-gray-600">
                Times: {reminder.timeToTake.map(time => formatTime(time)).join(", ")}
              </div>
              <p className="text-gray-600">
                Caregiver: {reminder.alternateCaregiverNumber}
              </p>
              {reminder.lastTakenAt && (
                <p className="text-sm text-gray-500">
                  Last taken: {new Date(reminder.lastTakenAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-x-2">
              {reminder.status === "PENDING" && (
                <Button
                  onClick={() => handleMarkAsTaken(reminder.id)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 my-2"
                >
                  Mark as Taken
                </Button>
              )}
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingReminder(reminder)}
                  disabled={isLoading}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(reminder.id)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={!!editingReminder} onOpenChange={() => setEditingReminder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medicine Reminder</DialogTitle>
          </DialogHeader>
          {editingReminder && (
            <MedicineReminderForm
              initialData={editingReminder}
              onSuccess={() => {
                setEditingReminder(null);
                onUpdate();
              }}
              onCancel={() => setEditingReminder(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}