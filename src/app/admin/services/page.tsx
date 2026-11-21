import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Manage Services",
};

export default function AdminServicesPage() {
  return (
    <DashboardPlaceholder
      title="Manage Services"
      description="Moderate service listings across the marketplace."
      items={[
        "Review newly submitted services",
        "Approve, feature, or remove listings",
        "Resolve vendor and customer reports",
      ]}
    />
  );
}
