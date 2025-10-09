import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import MedicineReminderManager from "./_components/medicine-reminder-manager";

export default async function MedicineRemindersPage() {
  const user = await checkUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <PageHeader
        title="Medicine Reminders"
        backLink="/appointments"
        backLabel="Back to Appointments"
      />
     <MedicineReminderManager />
    </div>
  );
}