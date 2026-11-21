import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Booking Requests",
};

export default function VendorBookingsPage() {
  return (
    <DashboardPlaceholder
      title="Booking Requests"
      description="Review inquiries from couples and respond with availability."
      items={[
        "See event date, venue, and estimated guest count",
        "Accept, decline, or request more details",
        "Connect booking requests to payments",
      ]}
    />
  );
}
