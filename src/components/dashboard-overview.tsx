"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/button-link";
import { DashboardMetrics, type DashboardMetric } from "@/components/dashboard-metrics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type Booking = {
  _id: string;
  serviceName: string;
  status: string;
  eventDate: string;
  customerName?: string;
  vendorName?: string;
};

type Overview = {
  metrics: DashboardMetric[];
  recent: Booking[];
  recentTitle: string;
  actionHref: string;
  actionLabel: string;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

async function loadOverview(role: "vendor" | "customer" | "admin"): Promise<Overview> {
  if (role === "vendor") {
    const [listingData, requestData, profileData] = await Promise.all([
      apiFetch<{ services: { isActive?: boolean }[] }>("/api/vendor/services"),
      apiFetch<{ bookings: Booking[] }>("/api/bookings/requests"),
      apiFetch<{ user: { subscriptionPlan?: string } }>("/api/auth/me"),
    ]);
    const active = listingData.services.filter((item) => item.isActive !== false).length;
    const pending = requestData.bookings.filter((item) => item.status === "pending").length;
    const premium = profileData.user.subscriptionPlan === "premium";

    return {
      metrics: [
        {
          label: "Active services",
          value: String(active),
          hint: active ? "Your published listings." : "Publish your first service to get started.",
        },
        {
          label: "New booking requests",
          value: String(pending),
          hint: pending ? "Waiting for your response." : "Requests will appear here in real time.",
        },
        {
          label: "Subscription",
          value: premium ? "Premium" : "Free",
          hint: premium ? "Unlimited listings enabled." : "Upgrade to reach more couples.",
        },
      ],
      recent: requestData.bookings.slice(0, 3),
      recentTitle: "Recent booking requests",
      actionHref: "/vendor/bookings",
      actionLabel: "View all requests",
    };
  }

  if (role === "customer") {
    const data = await apiFetch<{ bookings: Booking[] }>("/api/bookings/mine");
    const pending = data.bookings.filter((item) => item.status === "pending").length;
    const accepted = data.bookings.filter((item) => item.status === "accepted").length;

    return {
      metrics: [
        { label: "Total bookings", value: String(data.bookings.length) },
        {
          label: "Awaiting response",
          value: String(pending),
          hint: "Vendors usually reply within a day.",
        },
        { label: "Confirmed", value: String(accepted) },
      ],
      recent: data.bookings.slice(0, 3),
      recentTitle: "Your latest bookings",
      actionHref: "/customer/bookings",
      actionLabel: "View all bookings",
    };
  }

  const stats = await apiFetch<{
    users: number;
    services: number;
    pendingServices: number;
    bookings: number;
    transactions: number;
  }>("/api/admin/stats");

  return {
    metrics: [
      { label: "Users", value: String(stats.users) },
      { label: "Services", value: String(stats.services) },
      {
        label: "Pending approval",
        value: String(stats.pendingServices),
        hint: "Listings waiting for moderation.",
      },
      { label: "Bookings", value: String(stats.bookings) },
      { label: "Successful payments", value: String(stats.transactions) },
    ],
    recent: [],
    recentTitle: "",
    actionHref: "/admin/services",
    actionLabel: "Review services",
  };
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Live role-specific counters and a short activity list for each dashboard. */
export function DashboardOverview({ role }: { role: "vendor" | "customer" | "admin" }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await loadOverview(role);
        if (!cancelled) setOverview(data);
      } catch (loadError) {
        if (!cancelled) setError(messageOf(loadError));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!overview) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
        Loading dashboard…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardMetrics items={overview.metrics} />

      {overview.recent.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-lg">{overview.recentTitle}</CardTitle>
              <CardDescription>A quick look at what needs your attention.</CardDescription>
            </div>
            <ButtonLink href={overview.actionHref} variant="outline" size="sm">
              {overview.actionLabel}
            </ButtonLink>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview.recent.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{booking.serviceName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dateLabel(booking.eventDate)} · {booking.customerName ?? booking.vendorName ?? ""}
                  </p>
                </div>
                <span className="text-xs font-medium capitalize">{booking.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
            <p className="text-sm text-muted-foreground">
              {role === "admin"
                ? "Use the workspace menu to manage users and services."
                : "Everything is up to date."}
            </p>
            <ButtonLink href={overview.actionHref} variant="outline" size="sm">
              {overview.actionLabel}
            </ButtonLink>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
