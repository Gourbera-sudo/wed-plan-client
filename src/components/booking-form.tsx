"use client";

import { CheckCircleIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";

type BookingFormState = {
  ok: boolean;
  message: string;
} | null;

type BookingFormProps = {
  serviceId: string;
  minDate: string;
};

/**
 * Customer booking request form. All rules (role, ownership, approval, dates,
 * duplicates) are enforced by the Express API; this form only collects input.
 */
export function BookingForm({ serviceId, minDate }: BookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<BookingFormState>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(null);
    setPending(true);

    const data = new FormData(event.currentTarget);
    const eventDate = String(data.get("eventDate") ?? "").trim();
    const eventLocation = String(data.get("eventLocation") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      const failed = { ok: false, message: "Please choose a valid event date." };
      setState(failed);
      toast.add({ title: "Request not sent", description: failed.message, type: "error" });
      setPending(false);
      return;
    }
    if (eventLocation.length < 3 || eventLocation.length > 200) {
      const failed = {
        ok: false,
        message: "Please enter an event location (3–200 characters).",
      };
      setState(failed);
      toast.add({ title: "Request not sent", description: failed.message, type: "error" });
      setPending(false);
      return;
    }
    if (message.length > 1000) {
      const failed = { ok: false, message: "Your message must be 1000 characters or fewer." };
      setState(failed);
      toast.add({ title: "Request not sent", description: failed.message, type: "error" });
      setPending(false);
      return;
    }

    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: {
          serviceId,
          eventDate,
          eventLocation,
          guests: Number(data.get("guests")) || 0,
          message,
        },
      });

      const success = {
        ok: true,
        message: "Request sent. You can follow its status in your dashboard.",
      };
      setState(success);
      formRef.current?.reset();
      toast.add({ title: "Request sent", description: success.message, type: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send your request.";
      setState({ ok: false, message });
      toast.add({ title: "Request not sent", description: message, type: "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eventDate">Event date</Label>
        <Input
          id="eventDate"
          name="eventDate"
          type="date"
          min={minDate}
          required
          aria-describedby="booking-hint"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="eventLocation">Event location</Label>
        <Input
          id="eventLocation"
          name="eventLocation"
          type="text"
          placeholder="City, venue, or address"
          minLength={3}
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="guests">Estimated guests</Label>
        <Input
          id="guests"
          name="guests"
          type="number"
          min={0}
          max={10000}
          placeholder="Optional"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message to the vendor</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell them about your celebration, guest count, and anything else they should know."
          maxLength={1000}
          rows={4}
        />
        <p id="booking-hint" className="text-xs text-muted-foreground">
          Optional — up to 1000 characters.
        </p>
      </div>

      {state ? (
        <Alert variant={state.ok ? "default" : "destructive"}>
          {state.ok ? (
            <CheckCircleIcon aria-hidden="true" />
          ) : (
            <TriangleAlertIcon aria-hidden="true" />
          )}
          <AlertDescription>
            {state.message}{" "}
            {state.ok ? (
              <Link
                href="/customer/bookings"
                className="font-medium underline underline-offset-4"
              >
                View your bookings
              </Link>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
            Sending request…
          </>
        ) : (
          "Send booking request"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Requests are free. The vendor will respond after you send one.
      </p>
    </form>
  );
}
