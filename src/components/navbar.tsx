"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, MenuIcon } from "lucide-react";
import { useState } from "react";

import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "cn";


// Public navigation. Dashboard and profile settings live in the user menu so
// guests only see sign-in links and signed-in users see role-aware destinations.
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex w-fit items-center gap-2 font-heading text-lg font-semibold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <HeartIcon className="size-4" aria-hidden="true" />
      </span>
      <span>WedPlan</span>
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
              active ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Brand />

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Main"
        >
          <NavLinks pathname={pathname} />
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <UserMenu />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <MenuIcon className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <SheetHeader className="border-b">
              <SheetTitle>
                <Brand onNavigate={() => setMobileOpen(false)} />
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-2" aria-label="Mobile">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </nav>

            <SheetFooter className="border-t">
              <UserMenu variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
