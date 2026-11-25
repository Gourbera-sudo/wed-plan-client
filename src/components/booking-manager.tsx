"use client";

import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";

type Booking = {
  _id: string;
  serviceName: string;
  serviceCategory?: string;
  serviceImage?: string;
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
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);

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
              <div className="flex min-w-0 items-center gap-3">
                {booking.serviceImage ? (
                  <Image
                    src={booking.serviceImage}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">
                    {booking.serviceName}
                  </CardTitle>
                  <CardDescription className="truncate">
                    {booking.serviceCategory || "Wedding service"}
                    {booking.vendorName ? ` · ${booking.vendorName}` : ""}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Customer</dt>
                  <dd className="font-medium">
                    {mode === "vendor"
                      ? (booking.customerName ?? "A customer")
                      : "You"}
                  </dd>
                  {mode === "vendor" && booking.customerEmail ? (
                    <dd className="break-all text-xs text-muted-foreground">
                      {booking.customerEmail}
                    </dd>
                  ) : null}
                  {mode === "customer" && booking.vendorName ? (
                    <dd className="text-xs text-muted-foreground">
                      {booking.vendorName}
                    </dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Service</dt>
                  <dd className="font-medium">{booking.serviceName}</dd>
                  {booking.serviceCategory ? (
                    <dd className="text-xs text-muted-foreground">
                      {booking.serviceCategory}
                    </dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Event date</dt>
                  <dd className="font-medium">{dateLabel(booking.eventDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Event location</dt>
                  <dd className="font-medium">{booking.eventLocation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Guests</dt>
                  <dd className="font-medium">{booking.guests || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Customer message</dt>
                  <dd className="rounded-lg bg-muted/40 p-3 text-sm">
                    {booking.message || "No message provided."}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Requested {dateLabel(booking.createdAt)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDetailsBooking(booking)}
                >
                  View details
                </Button>
                {booking.status === "pending" ? (
                  mode === "vendor" ? (
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
                  )
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog
        open={detailsBooking !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsBooking(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>
              {detailsBooking?.serviceName ?? "Selected service"}
            </DialogDescription>
          </DialogHeader>
          {detailsBooking ? (
            <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Service</dt>
                <dd className="font-medium">{detailsBooking.serviceName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="font-medium">{badgeFor(detailsBooking.status).label}</dd>
              </div>
              {mode === "vendor" ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Customer</dt>
                  <dd className="font-medium">
                    {detailsBooking.customerName ?? "A customer"}
                  </dd>
                  {detailsBooking.customerEmail ? (
                    <dd className="break-all text-xs text-muted-foreground">
                      {detailsBooking.customerEmail}
                    </dd>
                  ) : null}
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Vendor</dt>
                  <dd className="font-medium">
                    {detailsBooking.vendorName ?? "WedPlan vendor"}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Event date</dt>
                <dd className="font-medium">{dateLabel(detailsBooking.eventDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Event location</dt>
                <dd className="font-medium">{detailsBooking.eventLocation}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Guests</dt>
                <dd className="font-medium">{detailsBooking.guests || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Requested</dt>
                <dd className="font-medium">{dateLabel(detailsBooking.createdAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Customer message</dt>
                <dd className="rounded-lg bg-muted/40 p-3 text-sm">
                  {detailsBooking.message || "No message provided."}
                </dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
