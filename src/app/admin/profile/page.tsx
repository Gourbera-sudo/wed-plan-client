import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Admin Profile Settings",
};

export default function AdminProfilePage() {
  return (
    <DashboardPlaceholder
      title="Profile Settings"
      description="Manage your admin account details."
      items={[
        "Name, email, and profile photo",
        "Notification and security preferences",
        "Administrative access settings",
      ]}
    />
  );
}
