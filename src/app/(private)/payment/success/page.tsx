import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/button-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Payment Successful",
};

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Card className="text-center">
        <CardHeader>
          <CheckCircleIcon className="mx-auto size-10 text-primary" aria-hidden="true" />
          <CardTitle className="font-heading text-2xl">Payment successful</CardTitle>
          <CardDescription>
            Your payment was received. We&apos;ll email the confirmation shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-2">
          <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
          <ButtonLink href="/services" variant="outline">
            Browse services
          </ButtonLink>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Need help? <Link href="/profile" className="underline underline-offset-4">Contact support</Link>
      </p>
    </div>
  );
}
