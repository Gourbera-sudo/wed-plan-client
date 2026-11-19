"use client";

import Link from "next/link";

import { AuthPrompt } from "@/components/auth-prompt";
import { ButtonLink } from "@/components/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSession } from "@/lib/auth";

export default function DashboardPage() {
  const user = useSession();
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  if (!user) {
    return (
      <AuthPrompt
        title="Sign in to view your dashboard"
        description="Your wedding plan and saved services live here."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back, {user.name}.</p>
        </div>
        <ButtonLink variant="outline" href="/profile">
          Profile Settings
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your plan</CardTitle>
            <CardDescription>Checklist and timeline will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Nothing scheduled yet.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saved services</CardTitle>
            <CardDescription>Vendors you shortlist are collected here.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link href="/services" className="underline underline-offset-4">
              Browse services
            </Link>{" "}
            to get started.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
            <CardDescription>Track deposits and payments in one place.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">No budget set yet.</CardContent>
        </Card>
      </div>
    </div>
  );
}
