"use client";

import {
  BadgeCheckIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  LoaderCircleIcon,
  QrCodeIcon,
  SmartphoneIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, type FormEvent } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";

type UpiOrder = {
  ref: string;
  amountPaise: number;
  amount: number;
  currency: string;
  vpa: string;
  payeeName: string;
  upiUri: string;
  status: string;
  utr: string | null;
};

type Profile = {
  plan: string;
  expiresAt: string | null;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function expiryLabel(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-IN");
}

function PlanFeature({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export function SubscriptionPanel() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [order, setOrder] = useState<UpiOrder | null>(null);
  const [utr, setUtr] = useState("");
  const [busy, setBusy] = useState<"upi" | "submit" | "stripe" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<{
          user: { subscriptionPlan?: string; subscriptionExpiresAt?: string | null };
        }>("/api/auth/me");
        if (cancelled) return;
        setProfile({
          plan: data.user.subscriptionPlan ?? "free",
          expiresAt: data.user.subscriptionExpiresAt ?? null,
        });
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

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError("Copy failed. Please select and copy the text manually.");
    }
  }

  async function startUpi() {
    setBusy("upi");
    setError(null);
    setMessage(null);
    try {
      const created = await apiFetch<UpiOrder>("/api/payments/upi/create", {
        method: "POST",
      });
      setOrder(created);
      if (created.utr) setUtr(created.utr);
    } catch (startError) {
      setError(messageOf(startError));
    } finally {
      setBusy(null);
    }
  }

  async function submitUtr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;

    setBusy("submit");
    setError(null);
    try {
      const result = await apiFetch<{ message: string }>(
        "/api/payments/upi/submit",
        { method: "POST", body: { ref: order.ref, utr } },
      );
      setMessage(result.message);
      setOrder({ ...order, status: "verifying", utr });
      toast.add({
        title: "Payment submitted",
        description: result.message,
        type: "success",
      });
      // The page reads server state, so the redirect is harmless; only the
      // admin verification endpoint can actually activate the plan.
      router.push(
        `/payment/success?method=upi&ref=${encodeURIComponent(order.ref)}`,
      );
    } catch (submitError) {
      const text = messageOf(submitError);
      setError(text);
      toast.add({ title: "Could not submit", description: text, type: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function startStripe() {
    setBusy("stripe");
    setError(null);
    try {
      const result = await apiFetch<{ url: string }>("/api/payments/checkout", {
        method: "POST",
      });
      window.location.assign(result.url);
    } catch (stripeError) {
      setError(messageOf(stripeError));
      setBusy(null);
    }
  }

  const isPremium = profile?.plan === "premium";
  const expires = expiryLabel(profile?.expiresAt ?? null);
  const submitted = order?.status === "verifying" || order?.status === "succeeded";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">Subscription</h2>
          <p className="text-sm text-muted-foreground">
            Choose the plan that fits your wedding business.
          </p>
        </div>
        {loading ? (
          <span className="text-sm text-muted-foreground">Loading plan…</span>
        ) : isPremium ? (
          <Badge className="w-fit gap-1">
            <BadgeCheckIcon className="size-3.5" aria-hidden="true" />
            Premium{expires ? ` until ${expires}` : ""}
          </Badge>
        ) : (
          <Badge variant="outline" className="w-fit">Free plan</Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={!isPremium ? "ring-2 ring-primary/30" : ""}>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-heading text-lg">Free Plan</CardTitle>
              <CardDescription>For vendors getting started on WedPlan.</CardDescription>
            </div>
            {!loading && !isPremium ? (
              <Badge variant="secondary">Current plan</Badge>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold">
              ₹0 <span className="text-sm font-normal text-muted-foreground">/ forever</span>
            </p>
            <ul className="space-y-2 text-sm">
              <PlanFeature>Maximum 3 Active Services</PlanFeature>
              <PlanFeature>Basic Vendor Dashboard</PlanFeature>
              <PlanFeature>Booking Request Management</PlanFeature>
            </ul>
          </CardContent>
        </Card>

        <Card className={isPremium ? "ring-2 ring-primary/30" : ""}>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-heading text-lg">Premium Plan</CardTitle>
              <CardDescription>For vendors ready to grow their bookings.</CardDescription>
            </div>
            {isPremium ? (
              <Badge>Current plan</Badge>
            ) : (
              <Badge variant="secondary">Most popular</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-2xl font-semibold">
              ₹499{" "}
              <span className="text-sm font-normal text-muted-foreground">/ 30 days</span>
            </p>
            <ul className="space-y-2 text-sm">
              <PlanFeature>Unlimited Active Services</PlanFeature>
              <PlanFeature>Premium Vendor Badge</PlanFeature>
              <PlanFeature>All Free Plan Features</PlanFeature>
            </ul>
            {isPremium ? (
              <p className="text-sm text-muted-foreground">
                {expires
                  ? `Your premium plan is active until ${expires}.`
                  : "Your premium plan is active."}
              </p>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={loading || busy !== null}
                onClick={() => void startUpi()}
              >
                {busy === "upi" ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <BadgeCheckIcon className="size-4" aria-hidden="true" />
                )}
                {busy === "upi" ? "Preparing payment…" : "Upgrade to Premium"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div id="payment-methods" className="space-y-3">
        <div>
          <h3 className="font-heading text-lg font-semibold">Payment methods</h3>
          <p className="text-sm text-muted-foreground">
            UPI payments are activated after admin verification; card payments
            activate automatically once Stripe confirms them.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCodeIcon className="size-5 text-primary" aria-hidden="true" />
                Pay with UPI
              </CardTitle>
              <CardDescription>
                Scan the code with any UPI app, or open the payment link on your phone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!order ? (
                <Button
                  type="button"
                  className="w-full"
                  disabled={loading || isPremium || busy !== null}
                  onClick={() => void startUpi()}
                >
                  {busy === "upi" ? (
                    <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <SmartphoneIcon className="size-4" aria-hidden="true" />
                  )}
                  {busy === "upi" ? "Creating payment…" : "Pay ₹499 with UPI"}
                </Button>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-5">
                    <div className="rounded-xl bg-white p-3">
                      <QRCodeSVG value={order.upiUri} size={180} level="M" />
                    </div>
                    <p className="text-center text-sm font-medium">
                      Pay ₹{order.amount.toFixed(2)} to {order.payeeName}
                    </p>
                    <p className="text-center text-xs text-muted-foreground">
                      UPI ID: {order.vpa}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void copy(order.upiUri, "link")}
                    >
                      <CopyIcon className="size-4" aria-hidden="true" />
                      {copied === "link" ? "Copied!" : "Copy UPI link"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="flex items-center gap-2 font-mono text-xs">
                      {order.ref}
                      <button
                        type="button"
                        aria-label="Copy reference"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => void copy(order.ref, "ref")}
                      >
                        <CopyIcon className="size-4" aria-hidden="true" />
                      </button>
                    </span>
                  </div>

                  <form onSubmit={submitUtr} className="space-y-2">
                    <Label htmlFor="utr">UPI transaction ID (UTR)</Label>
                    <Input
                      id="utr"
                      name="utr"
                      value={utr}
                      onChange={(event) => setUtr(event.target.value.toUpperCase())}
                      placeholder="e.g. 423918274651"
                      minLength={8}
                      maxLength={24}
                      required
                      disabled={submitted || busy !== null}
                    />
                    <p className="text-xs text-muted-foreground">
                      Copy this from your UPI app after paying. Premium is activated
                      after our team verifies the transaction.
                    </p>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitted || busy !== null}
                    >
                      {busy === "submit" ? (
                        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                      ) : null}
                      {submitted
                        ? "Submitted for verification"
                        : busy === "submit"
                          ? "Submitting…"
                          : "Submit payment ID"}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCardIcon className="size-5 text-primary" aria-hidden="true" />
                Pay by card
              </CardTitle>
              <CardDescription>
                Continue to our secure Stripe checkout (test mode).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Card payments activate premium automatically once the payment is
                confirmed by Stripe.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading || isPremium || busy !== null}
                onClick={() => void startStripe()}
              >
                {busy === "stripe" ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CreditCardIcon className="size-4" aria-hidden="true" />
                )}
                {busy === "stripe" ? "Opening checkout…" : "Continue to checkout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
