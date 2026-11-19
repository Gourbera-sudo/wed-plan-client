"use client";

import { AuthPrompt } from "@/components/auth-prompt";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSession } from "@/lib/auth";

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "W"
  );
}

export default function ProfilePage() {
  const user = useSession();
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  if (!user) {
    return (
      <AuthPrompt
        title="Sign in to manage your profile"
        description="Update your name, photo, and account details."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>How your account appears across WedPlan.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar size="lg">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Demo session stored in this browser.
          </p>
          <ButtonLink variant="outline" href="/dashboard">
            Back to dashboard
          </ButtonLink>
        </CardFooter>
      </Card>
    </div>
  );
}
