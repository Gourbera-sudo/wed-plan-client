"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

export type DashboardNavLink = {
  href: string;
  label: string;
};

export function DashboardNav({
  links,
  label,
}: {
  links: DashboardNavLink[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {links.map((link) => {
        const isRoot = link.href.split("/").filter(Boolean).length === 1;
        const active = isRoot
          ? pathname === link.href || pathname === `${link.href}/overview`
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
