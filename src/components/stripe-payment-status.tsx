"use client";

import { CheckCircleIcon, ClockIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api";

type PaymentStatus = {
  status: string;
  paymentStatus: string;
  plan?: string;
  effectivePlan: string;
  activated: boolean;
  subscriptionExpiresAt: string | null;
  transaction: { amount?: number; currency?: string; status?: string } | null;
};

/**
 * Reads Stripe-backed payment state from the API. Premium is activated by the
 * signed webhook, never by this redirect, so the page reports what the server
 * has actually verified.
 */
export function StripePaymentStatus({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function check() {
      try {
        const data = await apiFetch<PaymentStatus>(
          `/api/payments/status?session_id=${encodeURIComponent(sessionId)}`,
        );
        if (cancelled) return;
        setStatus(data);
        setError(null);
        return data.activated;
      } catch (checkError) {
        if (!cancelled) {
          setError(
            checkError instanceof Error
              ? checkError.message
              : "Could not confirm the payment.",
          );
        }
        return false;
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void check();
    const timer = window.setInterval(() => {
      attempts += 1;
      if (attempts > 12) {
        window.clearInterval(timer);
        return;
      }
      void check();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sessionId]);

  if (loading && !status && !error) {
    return (
      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
        Confirming your payment with Stripe…
      </p>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon aria-hidden="true" />
        <AlertTitle>Payment status unavailable</AlertTitle>
        <AlertDescription>
          {error} Your payment is not affected — please try again in a moment or{" "}
          <Link href="/vendor/subscription" className="underline underline-offset-4">
            check your subscription
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) return null;

  if (status.activated) {
    return (
      <Alert>
        <CheckCircleIcon aria-hidden="true" />
        <AlertTitle>Premium is active</AlertTitle>
        <AlertDescription>
          Stripe confirmed your payment and your account now has unlimited listings.
          {status.subscriptionExpiresAt
            ? ` Your plan is active until ${new Date(status.subscriptionExpiresAt).toLocaleDateString("en-IN")}.`
            : ""}
        </AlertDescription>
      </Alert>
    );
  }

  if (status.paymentStatus === "paid" || status.status === "complete") {
    return (
      <Alert>
        <ClockIcon aria-hidden="true" />
        <AlertTitle>Payment recorded</AlertTitle>
        <AlertDescription>
          Stripe has received your payment. Premium activates as soon as our webhook
          confirms it — this usually takes a few seconds.{" "}
          <Link href="/vendor/subscription" className="underline underline-offset-4">
            Refresh later
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>Payment not completed</AlertTitle>
      <AlertDescription>
        Stripe has not confirmed a completed payment for this checkout. No premium
        access was activated.{" "}
        <Link href="/vendor/subscription" className="underline underline-offset-4">
          Try again
        </Link>
        .
      </AlertDescription>
    </Alert>
  );
}
