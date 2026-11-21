import { DashboardMetrics } from "@/components/dashboard-metrics";
import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export default function VendorOverviewPage() {
  return (
    <div className="space-y-6">
      <DashboardMetrics
        items={[
          { label: "Active services", value: "0", hint: "Publish your first service to get started." },
          { label: "New booking requests", value: "0", hint: "Requests will appear here in real time." },
          { label: "Subscription", value: "Free", hint: "Upgrade to reach more couples." },
        ]}
      />
      <DashboardPlaceholder
        title="Welcome to your vendor workspace"
        description="Everything you need to run your wedding business on WedPlan."
        items={[
          "Add services with pricing and availability",
          "Review and respond to booking requests",
          "Track your subscription and profile completeness",
        ]}
      />
    </div>
  );
}
