import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";

export const instant = false;

const LINKS = [
  { href: "/customer", label: "Overview" },
  { href: "/customer/bookings", label: "My Bookings" },
  { href: "/customer/profile", label: "Profile Settings" },
];

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("customer");

  return (
    <DashboardShell
      role="customer"
      user={user}
      title="Customer dashboard"
      description="Track your wedding bookings and keep your profile up to date."
      links={LINKS}
    >
      {children}
    </DashboardShell>
  );
}
