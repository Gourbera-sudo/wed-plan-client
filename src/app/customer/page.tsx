import { ButtonLink } from "@/components/button-link";
import { DashboardMetrics } from "@/components/dashboard-metrics";
import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export default function CustomerOverviewPage() {
  return (
    <div className="space-y-6">
      <DashboardMetrics
        items={[
          { label: "Upcoming bookings", value: "0", hint: "Your confirmed services will appear here." },
          { label: "Pending requests", value: "0", hint: "Requests awaiting vendor response." },
          { label: "Saved vendors", value: "0", hint: "Shortlist vendors while you browse." },
        ]}
      />
      <DashboardPlaceholder
        title="Plan your big day"
        description="Discover vendors and keep every detail in one place."
        items={[
          "Browse venues, photography, catering, and more",
          "Send booking requests to your favorite vendors",
          "Track confirmations and payments",
        ]}
      >
        <ButtonLink href="/services" size="sm">
          Explore services
        </ButtonLink>
      </DashboardPlaceholder>
    </div>
  );
}
