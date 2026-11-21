import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";

export const instant = false;

const LINKS = [
  { href: "/vendor", label: "Overview" },
  { href: "/vendor/services", label: "My Services" },
  { href: "/vendor/services/new", label: "Add Service" },
  { href: "/vendor/bookings", label: "Booking Requests" },
  { href: "/vendor/subscription", label: "Subscription" },
  { href: "/vendor/profile", label: "Profile Settings" },
];

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("vendor");

  return (
    <DashboardShell
      role="vendor"
      user={user}
      title="Vendor dashboard"
      description="Manage your services, booking requests, subscription, and vendor profile."
      links={LINKS}
    >
      {children}
    </DashboardShell>
  );
}
