import { ButtonLink } from "@/components/button-link";
import { VendorServicesManager } from "@/components/vendor-services-manager";

export const metadata = {
  title: "My Services",
};

export default function VendorServicesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">My Services</h2>
          <p className="text-sm text-muted-foreground">
            Manage the wedding services you offer to couples.
          </p>
        </div>
        <ButtonLink href="/vendor/services/new" size="sm">
          Add a service
        </ButtonLink>
      </div>
      <VendorServicesManager />
    </div>
  );
}
