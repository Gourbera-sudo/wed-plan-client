import { ShieldAlertIcon } from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Access Denied",
};

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Card className="text-center">
        <CardHeader>
          <ShieldAlertIcon className="mx-auto size-10 text-primary" aria-hidden="true" />
          <CardTitle className="font-heading text-2xl">You don&apos;t have access</CardTitle>
          <CardDescription>
            That area belongs to a different role. Use the dashboard link for your account type,
            or sign in with the correct account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-2">
          <ButtonLink href="/dashboard">Go to my dashboard</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back home
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
