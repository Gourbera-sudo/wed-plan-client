import { BookingManager } from "@/components/booking-manager";

export const metadata = {
  title: "My Bookings",
};

export default function CustomerBookingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">My Bookings</h2>
        <p className="text-sm text-muted-foreground">
          Follow every request from submission to confirmation.
        </p>
      </div>
      <BookingManager mode="customer" />
    </div>
  );
}
