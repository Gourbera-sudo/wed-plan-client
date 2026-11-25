import { CompassIcon, HeartIcon } from "lucide-react";

import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-primary/5 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CompassIcon className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          404 · Off the map
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          This page is not on the guest list
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The link may be outdated, or the page may have moved. Head back home or browse the
          wedding services we have available.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/services" variant="outline">
            Browse services
          </ButtonLink>
        </div>
        <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <HeartIcon className="size-3.5 text-primary" aria-hidden="true" />
          WedPlan
        </p>
      </div>
    </main>
  );
}
