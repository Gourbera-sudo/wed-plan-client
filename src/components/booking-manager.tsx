"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";

type Booking = {
  _id: string;
  serviceName: string;
  serviceCategory?: string;
  vendorName?: string;
  customerName?: string;
  customerEmail?: string;
  eventDate: string;
  eventLocation: string;
  guests?: number;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function badgeFor(status: Booking["status"]) {
  if (status === "accepted") return { label: "Accepted", variant: "default" as const };
  if (status === "rejected") return { label: "Rejected", variant: "destructive" as const };
  if (status === "cancelled") return { label: "Cancelled", variant: "secondary" as const };
  return { label: "Pending", variant: "outline" as const };
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Customer bookings (`/mine`) and vendor requests (`/requests`). */
export function BookingManager({ mode }: { mode: "customer" | "vendor" }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path =
      mode === "vendor" ? "/api/bookings/requests" : "/api/bookings/mine";

    async function load() {
      try {
        const data = await apiFetch<{ bookings: Booking[] }>(path);
        if (!cancelled) setBookings(data.bookings ?? []);
      } catch (loadError) {
        if (!cancelled) setError(messageOf(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  async function decide(booking: Booking, status: Booking["status"]) {
    setBusyId(booking._id);
    setError(null);
    try {
      await apiFetch(`/api/bookings/${booking._id}`, {
        method: "PATCH",
        body: { status },
      });
      setBookings((current) =>
        current.map((item) =>
          item._id === booking._id ? { ...item, status } : item,
        ),
      );
      toast.add({
        title: "Booking updated",
        description: `${booking.serviceName} is now ${status}.`,
        type: "success",
      });
    } catch (decideError) {
      const text = messageOf(decideError);
      setError(text);
      toast.add({ title: "Could not update", description: text, type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading bookings…</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {mode === "vendor"
            ? "No booking requests yet."
            : "You haven't requested any bookings yet."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const badge = badgeFor(booking.status);
        const busy = busyId === booking._id;

        return (
          <Card key={booking._id}>
            <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">{booking.serviceName}</CardTitle>
                <CardDescription>
                  {dateLabel(booking.eventDate)} · {booking.eventLocation}
                  {booking.guests ? ` · ${booking.guests} guests` : ""}
                </CardDescription>
              </div>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground">
                Requested {dateLabel(booking.createdAt)}
              </p>
              <p className="text-muted-foreground">
                {mode === "vendor"
                  ? `Requested by ${booking.customerName ?? "a customer"}${booking.customerEmail ? ` (${booking.customerEmail})` : ""}`
                  : `Vendor: ${booking.vendorName ?? "WedPlan vendor"}`}
              </p>
              {booking.message ? (
                <p className="rounded-lg bg-muted/40 p-3 text-sm">
                  {booking.message}
                </p>
              ) : null}
              {booking.status === "pending" ? (
                <div className="flex flex-wrap gap-2">
                  {mode === "vendor" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => void decide(booking, "accepted")}
                      >
                        {busy ? (
                          <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                        ) : null}
                        Accept
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void decide(booking, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void decide(booking, "cancelled")}
                    >
                      Cancel request
                    </Button>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
