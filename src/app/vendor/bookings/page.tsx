import { BookingManager } from "@/components/booking-manager";

export const metadata = {
  title: "Booking Requests",
};

export default function VendorBookingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Booking Requests</h2>
        <p className="text-sm text-muted-foreground">
          Accept or reject requests from couples. Only pending requests can be changed.
        </p>
      </div>
      <BookingManager mode="vendor" />
    </div>
  );
}
