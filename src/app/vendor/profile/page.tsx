import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Vendor Profile Settings",
};

export default function VendorProfilePage() {
  return (
    <DashboardPlaceholder
      title="Profile Settings"
      description="Manage your business profile and public presence."
      items={[
        "Business name, logo, and description",
        "Contact details and service areas",
        "Social links and portfolio highlights",
      ]}
    />
  );
}
