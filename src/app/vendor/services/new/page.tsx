import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Add Service",
};

export default function VendorAddServicePage() {
  return (
    <DashboardPlaceholder
      title="Add Service"
      description="Create a new listing for couples to discover."
      items={[
        "Service name, category, and description",
        "Packages, add-ons, and pricing",
        "Gallery images and service area",
      ]}
    />
  );
}
