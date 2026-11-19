"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  HeartIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { signOut, useSession, type SessionUser } from "@/lib/auth";
import { cn } from "cn";
import { useState } from "react";

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

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "W";
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

function UserAvatar({ user, size }: { user: SessionUser; size?: "sm" | "default" | "lg" }) {
  return (
    <Avatar size={size}>
      {user.image ? <AvatarImage src={user.image} alt="" /> : null}
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
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

function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 gap-2 rounded-full px-1.5 sm:pr-2.5"
            aria-label={`${user.name} account menu`}
          />
        }
      >
        <UserAvatar user={user} size="sm" />
        <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
          {user.name}
        </span>
        <ChevronDownIcon className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/dashboard" />}>
            <LayoutDashboardIcon aria-hidden="true" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <SettingsIcon aria-hidden="true" />
            Profile Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOutIcon aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GuestActions({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ButtonLink href="/sign-in" variant="ghost" onClick={onNavigate}>
        Sign In
      </ButtonLink>
      <ButtonLink href="/sign-up" onClick={onNavigate}>
        Sign Up
      </ButtonLink>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSignOut() {
    setMobileOpen(false);
    signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 w-full border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Brand />

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <GuestActions className="hidden md:flex" />
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
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
                <NavLinks
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </nav>

              <Separator className="mx-4" />

              <SheetFooter>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 pb-2">
                      <UserAvatar user={user} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <ButtonLink
                      variant="outline"
                      className="w-full justify-start"
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboardIcon aria-hidden="true" />
                      Dashboard
                    </ButtonLink>
                    <ButtonLink
                      variant="outline"
                      className="w-full justify-start"
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                    >
                      <SettingsIcon aria-hidden="true" />
                      Profile Settings
                    </ButtonLink>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOutIcon aria-hidden="true" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <GuestActions className="flex-col items-stretch" onNavigate={() => setMobileOpen(false)} />
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
