import { CheckCircleIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/button-link";
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

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Card className="text-center">
        <CardHeader>
          {isUpi ? (
            <ClockIcon className="mx-auto size-10 text-primary" aria-hidden="true" />
          ) : (
            <CheckCircleIcon className="mx-auto size-10 text-primary" aria-hidden="true" />
          )}
          <CardTitle className="font-heading text-2xl">
            {isUpi ? "Payment submitted" : "Payment successful"}
          </CardTitle>
          <CardDescription>
            {isUpi
              ? "Your UPI payment ID was recorded. Premium activates once an administrator verifies the transaction."
              : "Your payment was received. Premium will be activated once the payment is confirmed."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isUpi && ref ? <UpiPaymentStatus paymentRef={ref} /> : null}
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
