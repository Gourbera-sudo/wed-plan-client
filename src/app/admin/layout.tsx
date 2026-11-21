import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";

export const instant = false;

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Manage Users" },
  { href: "/admin/services", label: "Manage Services" },
  { href: "/admin/transactions", label: "Transactions" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");

  return (
    <DashboardShell
      role="admin"
      user={user}
      title="Admin dashboard"
      description="Oversee users, services, and platform transactions."
      links={LINKS}
    >
      {children}
    </DashboardShell>
  );
}
