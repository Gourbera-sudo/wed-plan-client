"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorFallback({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message =
    error instanceof Error && error.message
      ? error.message
      : "An unexpected error interrupted this page.";

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-primary/5 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlertIcon className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <Button type="button" className="mt-7" onClick={retry}>
          Try again
        </Button>
      </div>
    </main>
  );
}
