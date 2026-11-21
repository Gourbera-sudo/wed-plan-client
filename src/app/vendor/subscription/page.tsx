import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Subscription",
};

export default function VendorSubscriptionPage() {
  return (
    <DashboardPlaceholder
      title="Subscription"
      description="Choose a plan that fits your wedding business."
      items={[
        "Compare Free, Starter, and Pro plans",
        "Update payment method and billing details",
        "View invoices and renewal dates",
      ]}
    />
  );
}
