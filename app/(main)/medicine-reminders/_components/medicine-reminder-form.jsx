"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addMedicineReminder, editMedicineReminder } from "@/actions/medicine-reminder";

export default function MedicineReminderForm({ onSuccess, onCancel, initialData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [times, setTimes] = useState(
    initialData 
      ? initialData.timeToTake.map(time => 
          new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        )
      : [""]
  );

  const handleAddTime = () => {
    setTimes([...times, ""]);
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleRemoveTime = (index) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const timeToTake = times
        .filter(time => time) // Remove empty times
        .map(time => new Date(`2025-01-01T${time}`)); // Convert time strings to Date objects

      const frequency = formData.get("frequency");
      const data = {
        medicineName: formData.get("medicineName"),
        dosage: formData.get("dosage"),
        frequency,
        days: frequency === "SPECIFIC_DAYS" ? [] : [], // We'll add day selection later
        timeToTake,
        alternateCaregiverNumber: formData.get("alternateCaregiverNumber"),
      };

      const result = initialData
        ? await editMedicineReminder(initialData.id, data)
        : await addMedicineReminder(data);
      
      if (result.success) {
        onSuccess();
      } else {
        toast.error(result.error || "Failed to add medicine reminder");
      }
    } catch (error) {
      toast.error("Failed to add medicine reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="medicineName">Medicine Name</Label>
        <Input
          id="medicineName"
          name="medicineName"
          required
          placeholder="Enter medicine name"
          defaultValue={initialData?.medicineName || ""}
        />
      </div>

      <div>
        <Label htmlFor="dosage">Dosage</Label>
        <Input
          id="dosage"
          name="dosage"
          required
          placeholder="e.g., 1 tablet, 2 pills"
          defaultValue={initialData?.dosage || ""}
        />
      </div>

      <div>
        <Label htmlFor="frequency">Frequency</Label>
        <Select name="frequency" defaultValue={initialData?.frequency || "DAILY"}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="SPECIFIC_DAYS">Specific Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Time to Take</Label>
        {times.map((time, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              required
            />
            {times.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveTime(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAddTime}>
          Add Another Time
        </Button>
      </div>

      <div>
        <Label htmlFor="alternateCaregiverNumber">Caregiver&apos;s Phone Number</Label>
        <Input
          id="alternateCaregiverNumber"
          name="alternateCaregiverNumber"
          type="tel"
          required
          placeholder="Enter phone number"
          defaultValue={initialData?.alternateCaregiverNumber || ""}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Medicine"}
        </Button>
      </div>
    </form>
  );
}