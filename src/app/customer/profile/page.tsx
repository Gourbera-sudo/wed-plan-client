import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Customer Profile Settings",
};

export default function CustomerProfilePage() {
  return (
    <DashboardPlaceholder
      title="Profile Settings"
      description="Manage your personal details and wedding preferences."
      items={[
        "Name, email, and profile photo",
        "Wedding date and location",
        "Preferred vendors and communication settings",
      ]}
    />
  );
}
