import { CircleXIcon } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/button-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Payment Canceled",
};

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Card className="text-center">
        <CardHeader>
          <CircleXIcon className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="font-heading text-2xl">Payment canceled</CardTitle>
          <CardDescription>
            No charge was made. You can return to your dashboard and try again whenever you&apos;re ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-2">
          <ButtonLink href="/dashboard">Back to dashboard</ButtonLink>
          <ButtonLink href="/services" variant="outline">
            Browse services
          </ButtonLink>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Questions? <Link href="/profile" className="underline underline-offset-4">Contact support</Link>
      </p>
    </div>
  );
}
