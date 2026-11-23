"use client";

import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react";
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

type Transaction = {
  _id: string;
  ref?: string;
  stripeSessionId?: string;
  method?: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  plan?: string;
  utr?: string | null;
  createdAt?: string;
  verifiedAt?: string;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function money(tx: Transaction) {
  const amount = tx.currency === "inr" ? tx.amount / 100 : tx.amount / 100;
  return new Intl.NumberFormat(tx.currency === "inr" ? "en-IN" : "en-US", {
    style: "currency",
    currency: tx.currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

function when(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN");
}

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyRef, setBusyRef] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<{ transactions: Transaction[] }>(
          "/api/admin/transactions",
        );
        if (!cancelled) setTransactions(data.transactions ?? []);
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
  }, []);

  async function decide(tx: Transaction, action: "approve" | "reject") {
    if (!tx.ref) return;
    setBusyRef(tx.ref);
    setError(null);
    try {
      const result = await apiFetch<{ message: string }>(
        `/api/admin/transactions/${encodeURIComponent(tx.ref)}/verify`,
        { method: "PATCH", body: { action } },
      );
      setTransactions((current) =>
        current.map((item) =>
          item.ref === tx.ref
            ? {
                ...item,
                status: action === "approve" ? "succeeded" : "failed",
                verifiedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      toast.add({ title: "Payment reviewed", description: result.message, type: "success" });
    } catch (decideError) {
      const text = messageOf(decideError);
      setError(text);
      toast.add({ title: "Could not review", description: text, type: "error" });
    } finally {
      setBusyRef(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading transactions…</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No transactions yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isUpi = tx.method === "upi" || Boolean(tx.ref);
        const canVerify = isUpi && tx.status === "verifying";
        const pending = busyRef === tx.ref;

        return (
          <Card key={tx._id}>
            <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  {money(tx)} · {tx.plan === "premium" ? "Premium" : "Plan"}
                </CardTitle>
                <CardDescription>
                  {isUpi ? `UPI · ${tx.ref}` : "Card · Stripe"} · {when(tx.createdAt)}
                </CardDescription>
              </div>
              <Badge
                variant={
                  tx.status === "succeeded"
                    ? "default"
                    : tx.status === "failed"
                      ? "destructive"
                      : "outline"
                }
              >
                {tx.status === "awaiting_upi"
                  ? "Awaiting payment"
                  : tx.status === "verifying"
                    ? "Awaiting verification"
                    : tx.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-muted-foreground">
                <p>
                  Vendor: <span className="font-mono text-xs">{tx.userId}</span>
                </p>
                {tx.utr ? <p>UTR: <span className="font-mono text-xs">{tx.utr}</span></p> : null}
                {tx.verifiedAt ? <p>Reviewed: {when(tx.verifiedAt)}</p> : null}
              </div>
              {canVerify ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    onClick={() => void decide(tx, "approve")}
                  >
                    {pending ? (
                      <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CheckIcon className="size-4" aria-hidden="true" />
                    )}
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => void decide(tx, "reject")}
                  >
                    <XIcon className="size-4" aria-hidden="true" />
                    Reject
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
