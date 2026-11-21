import { ButtonLink } from "@/components/button-link";
import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "My Services",
};

export default function VendorServicesPage() {
  return (
    <DashboardPlaceholder
      title="My Services"
      description="Manage the wedding services you offer to couples."
      items={[
        "Service cards with photos, packages, and starting prices",
        "Availability and service areas",
        "Publish, pause, or archive a service",
      ]}
    >
      <ButtonLink href="/vendor/services/new" size="sm">
        Add a service
      </ButtonLink>
    </DashboardPlaceholder>
  );
}
