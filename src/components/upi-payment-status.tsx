"use client";

import { CheckCircleIcon, LoaderCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type UpiStatus = {
  status: string;
  utr: string | null;
  plan: string;
  activated: boolean;
  subscriptionExpiresAt: string | null;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Polls the server for admin verification — the client never flips the plan. */
export function UpiPaymentStatus({ paymentRef }: { paymentRef: string }) {
  const [status, setStatus] = useState<UpiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stopped, setStopped] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await apiFetch<UpiStatus>(
        `/api/payments/upi/status?ref=${encodeURIComponent(paymentRef)}`,
      );
      setStatus(result);
      setError(null);
    } catch (pollError) {
      setError(messageOf(pollError));
      setStopped(true);
    }
  }, [paymentRef]);

  useEffect(() => {
    if (stopped) return;
    const immediate = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), 6000);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(timer);
    };
  }, [refresh, stopped]);

  const settled = status?.status === "succeeded" || status?.status === "failed";

  return (
    <div className="space-y-3 rounded-xl bg-muted/40 p-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">Payment reference</span>
        <span className="font-mono text-xs">{paymentRef}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">Status</span>
        {status ? (
          <Badge
            variant={
              status.status === "succeeded"
                ? "default"
                : status.status === "failed"
                  ? "destructive"
                  : "outline"
            }
            className="gap-1"
          >
            {status.status === "succeeded" ? (
              <CheckCircleIcon className="size-3.5" aria-hidden="true" />
            ) : status.status === "verifying" ? (
              <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
            ) : null}
            {status.status === "awaiting_upi"
              ? "Awaiting payment"
              : status.status === "verifying"
                ? "Verifying"
                : status.status}
          </Badge>
        ) : (
          <span className="text-sm">Checking…</span>
        )}
      </div>
      {status?.status === "succeeded" ? (
        <p className="text-sm text-primary">Premium is active on your account.</p>
      ) : null}
      {status?.status === "verifying" ? (
        <p className="text-sm text-muted-foreground">
          We received your payment ID. An administrator will verify it shortly —
          this page updates automatically.
        </p>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {!settled ? (
        <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
          Refresh status
        </Button>
      ) : null}
    </div>
  );
}
