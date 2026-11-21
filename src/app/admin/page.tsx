import { DashboardMetrics } from "@/components/dashboard-metrics";
import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <DashboardMetrics
        items={[
          { label: "Total users", value: "0", hint: "Customers, vendors, and admins." },
          { label: "Active services", value: "0", hint: "Listings currently published." },
          { label: "Transactions", value: "0", hint: "Completed platform payments." },
        ]}
      />
      <DashboardPlaceholder
        title="Platform overview"
        description="A high-level view of marketplace activity."
        items={[
          "Monitor new registrations and vendor onboarding",
          "Moderate services and resolve reports",
          "Review payouts and transaction history",
        ]}
      />
    </div>
  );
}
