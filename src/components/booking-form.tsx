"use client";

import { CheckCircleIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import {
  submitBookingRequest,
  type BookingFormState,
} from "@/app/actions/bookings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

const INITIAL_STATE: BookingFormState = null;

type BookingFormProps = {
  serviceId: string;
  minDate: string;
};

/** Customer booking request form, validated and written by a Server Action. */
export function BookingForm({ serviceId, minDate }: BookingFormProps) {
  const [state, formAction, pending] = useActionState(
    submitBookingRequest,
    INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;

    toast.add({
      title: state.ok ? "Request sent" : "Request not sent",
      description: state.message,
      type: state.ok ? "success" : "error",
    });

    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />

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
                href="/customer"
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
