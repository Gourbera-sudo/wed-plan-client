import { ClockIcon } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/button-link";
import { StripePaymentStatus } from "@/components/stripe-payment-status";
import { UpiPaymentStatus } from "@/components/upi-payment-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export const metadata = {
  title: "Payment Successful",
};

function firstOf(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function PaymentSuccessPage({
  searchParams,
}: PageProps<"/payment/success">) {
  const query = await searchParams;
  const isUpi = firstOf(query.method) === "upi";
  const ref = firstOf(query.ref);
  const sessionId = firstOf(query.session_id);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Card className="text-center">
        <CardHeader>
          {isUpi ? (
            <ClockIcon className="mx-auto size-10 text-primary" aria-hidden="true" />
          ) : null}
          <CardTitle className="font-heading text-2xl">
            {isUpi ? "Payment submitted" : "Payment confirmation"}
          </CardTitle>
          <CardDescription>
            {isUpi
              ? "Your UPI payment ID was recorded. Premium activates once an administrator verifies the transaction."
              : "We verify card payments with Stripe before activating premium."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isUpi && ref ? <UpiPaymentStatus paymentRef={ref} /> : null}
          {!isUpi && sessionId ? <StripePaymentStatus sessionId={sessionId} /> : null}
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href="/vendor/subscription">Back to subscription</ButtonLink>
            <ButtonLink href="/dashboard" variant="outline">
              Go to dashboard
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Need help? <Link href="/profile" className="underline underline-offset-4">Contact support</Link>
      </p>
    </div>
  );
}
