import type { ReactNode } from "react";

import { DashboardNav, type DashboardNavLink } from "@/components/dashboard-nav";
import { SignOutButton } from "@/components/sign-out-button";
import type { AuthUser, Role } from "@/lib/auth-guards";

const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

export function DashboardShell({
  role,
  user,
  title,
  description,
  links,
  children,
}: {
  role: Role;
  user: AuthUser;
  title: string;
  description: string;
  links: DashboardNavLink[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            {ROLE_LABEL[role]} dashboard
          </span>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:border-r lg:pr-4">
          <p className="mb-2 hidden px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase lg:block">
            Workspace
          </p>
          <DashboardNav links={links} label={`${ROLE_LABEL[role]} dashboard sections`} />
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
