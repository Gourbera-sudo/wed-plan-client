import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "My Bookings",
};

export default function CustomerBookingsPage() {
  return (
    <DashboardPlaceholder
      title="My Bookings"
      description="See every service you have booked or requested."
      items={[
        "Confirmed bookings with dates and vendors",
        "Pending requests and vendor responses",
        "Payment status and receipts",
      ]}
    />
  );
}
