"use client";

import { ButtonLink } from "@/components/button-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthPrompt({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex justify-center px-4 py-16 sm:py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/sign-in">Sign In</ButtonLink>
          <ButtonLink variant="outline" href="/sign-up">
            Sign Up
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
