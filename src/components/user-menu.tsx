"use client";

import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LoaderCircleIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ButtonLink } from "@/components/button-link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { clearApiToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "cn";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type UserMenuProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

function getInitials(name?: string | null) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}

function AccountAvatar({
  user,
  size = "default",
  className,
}: {
  user: SessionUser;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Profile image"} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

function GuestLinks({
  mobile,
  onNavigate,
}: {
  mobile: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <ButtonLink
        href="/sign-in"
        variant={mobile ? "outline" : "ghost"}
        className={mobile ? "w-full" : undefined}
        onClick={onNavigate}
      >
        Sign In
      </ButtonLink>
      <ButtonLink
        href="/sign-up"
        className={mobile ? "w-full" : undefined}
        onClick={onNavigate}
      >
        Sign Up
      </ButtonLink>
    </>
  );
}

function SessionSkeleton({ mobile }: { mobile: boolean }) {
  if (mobile) {
    return (
      <div className="w-full space-y-2" aria-hidden="true">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="hidden h-4 w-20 sm:block" />
    </div>
  );
}

function DesktopUserMenu({
  user,
  profileHref,
  signingOut,
  signOutError,
  onSignOut,
}: {
  user: SessionUser;
  profileHref: string;
  signingOut: boolean;
  signOutError: boolean;
  onSignOut: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open profile menu"
          className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "gap-2 px-1.5")}
        >
          <HoverCard>
            <HoverCardTrigger render={<span className="inline-flex rounded-full" />}>
              <AccountAvatar user={user} />
            </HoverCardTrigger>
            <HoverCardContent side="bottom" align="start" className="w-64 space-y-3">
              <div className="flex items-center gap-2">
                <AccountAvatar user={user} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                type="button"
                variant={signOutError ? "destructive" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={onSignOut}
                disabled={signingOut}
              >
                {signingOut ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOutIcon aria-hidden="true" />
                )}
                {signOutError ? "Logout failed" : signingOut ? "Logging out..." : "Logout"}
              </Button>
            </HoverCardContent>
          </HoverCard>
          <span className="max-w-28 truncate text-sm font-medium">
            {user.name}
          </span>
          <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60 p-1.5">
          <div className="px-1.5 py-2">
            <div className="flex items-center gap-2">
              <AccountAvatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLinkItem render={<Link href="/dashboard" />}>
              <LayoutDashboardIcon />
              Dashboard
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem render={<Link href={profileHref} />}>
              <SettingsIcon />
              Profile Settings
            </DropdownMenuLinkItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {signOutError ? (
            <p role="alert" className="px-1.5 py-1 text-xs text-destructive">
              Logout failed
            </p>
          ) : null}

          <DropdownMenuItem
            variant="destructive"
            onClick={onSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOutIcon aria-hidden="true" />
            )}
            {signingOut ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileUserMenu({
  user,
  profileHref,
  signingOut,
  signOutError,
  onSignOut,
  onNavigate,
}: {
  user: SessionUser;
  profileHref: string;
  signingOut: boolean;
  signOutError: boolean;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center gap-3 p-3">
        <AccountAvatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="divide-y border-t">
        <ButtonLink
          href="/dashboard"
          variant="ghost"
          className="w-full justify-start rounded-none"
          onClick={onNavigate}
        >
          <LayoutDashboardIcon />
          Dashboard
        </ButtonLink>
        <ButtonLink
          href={profileHref}
          variant="ghost"
          className="w-full justify-start rounded-none"
          onClick={onNavigate}
        >
          <SettingsIcon />
          Profile Settings
        </ButtonLink>
        <Button
          type="button"
          variant="destructive"
          className="w-full justify-start rounded-none"
          onClick={onSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOutIcon aria-hidden="true" />
          )}
          {signingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>

      {signOutError ? (
        <p role="alert" className="border-t px-3 py-2 text-xs text-destructive">
          Logout failed
        </p>
      ) : null}
    </div>
  );
}

export function UserMenu({ variant = "desktop", onNavigate }: UserMenuProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  const isMobile = variant === "mobile";
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;
  const profileHref =
    role === "customer"
      ? "/customer/profile"
      : role === "vendor"
        ? "/vendor/profile"
        : role === "admin"
          ? "/admin/profile"
          : "/profile";

  async function handleSignOut() {
    setSignOutError(false);
    setSigningOut(true);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        setSignOutError(true);
        return;
      }

      clearApiToken();
      onNavigate?.();
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }

  if (isPending) {
    return <SessionSkeleton mobile={isMobile} />;
  }

  if (!user) {
    return <GuestLinks mobile={isMobile} onNavigate={onNavigate} />;
  }

  if (isMobile) {
    return (
      <MobileUserMenu
        user={user}
        profileHref={profileHref}
        signingOut={signingOut}
        signOutError={signOutError}
        onSignOut={handleSignOut}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <DesktopUserMenu
      user={user}
      profileHref={profileHref}
      signingOut={signingOut}
      signOutError={signOutError}
      onSignOut={handleSignOut}
    />
  );
}
