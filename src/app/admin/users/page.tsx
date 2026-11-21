import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Manage Users",
};

export default function AdminUsersPage() {
  return (
    <DashboardPlaceholder
      title="Manage Users"
      description="Review accounts and assign roles across WedPlan."
      items={[
        "Search users by name or email",
        "Assign customer, vendor, or admin roles",
        "Suspend or reactivate accounts",
      ]}
    />
  );
}
