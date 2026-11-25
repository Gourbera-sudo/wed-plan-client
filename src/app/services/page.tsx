import type { Metadata } from "next";

import { ServicesBrowser, type BrowseParams } from "@/components/services-browser";

export const instant = false;

export const metadata: Metadata = {
  title: "Browse Services",
};

function toPositiveInt(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1;
}

function firstOf(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Public catalogue: guests can browse and filter; only details require auth. */
export default async function ServicesPage({
  searchParams,
}: PageProps<"/services">) {
  const query = await searchParams;

  const sortParam = firstOf(query.sort);
  const initial: BrowseParams = {
    search: firstOf(query.search).slice(0, 100),
    category: firstOf(query.category),
    location: firstOf(query.location).slice(0, 100),
    sort: sortParam === "price_desc" ? "price_desc" : "price_asc",
    page: toPositiveInt(query.page),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
          Approved vendors only
        </span>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse Services
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search by name, filter by category and location, and sort by price to
          find the right vendor for your day.
        </p>
      </header>

      <div className="mt-8">
        <ServicesBrowser initial={initial} />
      </div>
    </div>
  );
}
