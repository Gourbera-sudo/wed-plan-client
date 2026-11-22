"use client";

import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiError } from "@/lib/api";
import {
  SERVICE_CATEGORY_ORDER,
  type FeaturedService,
} from "@/lib/service-constants";

type BrowseResponse = {
  services: Array<Record<string, unknown>>;
  total: number;
  page: number;
  pages: number;
};

export type BrowseParams = {
  search: string;
  category: string;
  location: string;
  sort: "price_asc" | "price_desc";
  page: number;
};

const EMPTY_PARAMS: BrowseParams = {
  search: "",
  category: "",
  location: "",
  sort: "price_asc",
  page: 1,
};

/** Maps a raw API service document onto the shared card shape. */
function toCardService(doc: Record<string, unknown>): FeaturedService {
  const images = Array.isArray(doc.images) ? (doc.images as string[]) : [];
  return {
    id: String(doc._id),
    name: String(doc.name ?? ""),
    category: String(doc.category ?? ""),
    price: Number(doc.price ?? 0),
    location: String(doc.location ?? ""),
    image: images[0] ?? String(doc.image ?? ""),
    vendor: {
      name: String(doc.vendorName ?? ""),
      businessName: String(doc.vendorBusinessName ?? "") || String(doc.vendorName ?? ""),
      verified: Boolean(doc.vendorVerified),
    },
  };
}

function buildQuery(params: BrowseParams) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.location) query.set("location", params.location);
  if (params.sort !== "price_asc") query.set("sort", params.sort);
  if (params.page > 1) query.set("page", String(params.page));
  return query.toString();
}

/**
 * Browse UI: search, category + location filters, price sort, pagination.
 * Results come from `GET /api/services` with the API JWT attached.
 */
export function ServicesBrowser({ initial }: { initial: BrowseParams }) {
  const router = useRouter();
  const [params, setParams] = useState<BrowseParams>(initial);
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  // Debounced text inputs update the shared params after 350ms.
  const [searchText, setSearchText] = useState(initial.search);
  const [locationText, setLocationText] = useState(initial.location);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParams((prev) => {
        if (prev.search === searchText && prev.location === locationText) return prev;
        return { ...prev, search: searchText, location: locationText, page: 1 };
      });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, locationText]);

  // Keep the URL shareable/back-forward friendly. Skipped when the URL
  // already matches (mount with no filters) — a redundant replace re-fetches
  // the RSC payload and can replay a stale signed-out render.
  useEffect(() => {
    const query = buildQuery(params);
    if (query === window.location.search.replace(/^\?/, "")) return;
    router.replace(query ? `/services?${query}` : "/services", { scroll: false });
  }, [params, router]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const query = buildQuery(params);
        const data = await apiFetch<BrowseResponse>(
          `/api/services${query ? `?${query}` : ""}`,
          { auth: false, signal: controller.signal },
        );
        if (cancelled) return;
        setServices(data.services.map(toCardService));
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : "Could not load services.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [params, retryToken]);

  const patch = useCallback((next: Partial<BrowseParams>) => {
    setParams((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  const hasFilters =
    Boolean(searchText || locationText || params.category) ||
    params.sort !== "price_asc";

  const clearFilters = () => {
    setSearchText("");
    setLocationText("");
    setParams({ ...EMPTY_PARAMS });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl bg-secondary/60 p-4 ring-1 ring-foreground/10 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontalIcon className="size-4 text-primary" aria-hidden="true" />
          Find the right vendor
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="browse-search">Search by name</Label>
            <div className="relative">
              <SearchIcon
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="browse-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Venues, photographers, caterers…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="browse-location">Location</Label>
            <Input
              id="browse-location"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="City or state"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Sort by price</Label>
            <Select
              value={params.sort}
              onValueChange={(value) =>
                patch({ sort: value as BrowseParams["sort"] })
              }
            >
              <SelectTrigger id="browse-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Label className="sr-only" htmlFor="browse-category">
            Category
          </Label>
          <Select
            value={params.category || "all"}
            onValueChange={(value) =>
              patch({ category: !value || value === "all" ? "" : value })
            }
          >
            <SelectTrigger id="browse-category" className="w-full sm:w-64">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {SERVICE_CATEGORY_ORDER.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}

          <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
            {loading ? "Searching…" : `${total} service${total === 1 ? "" : "s"} found`}
          </p>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>Couldn&apos;t load services</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {error}
            <Button size="sm" variant="outline" onClick={() => setRetryToken((t) => t + 1)}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : loading && services.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full">
              <Skeleton className="aspect-4/3 w-full rounded-none" />
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl bg-secondary/70 px-6 py-14 text-center ring-1 ring-foreground/10">
          <SearchIcon className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-heading text-lg font-medium">No services match your search</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different category, location, or price range.
          </p>
          <Button className="mt-5" variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {pages > 1 ? (
            <nav
              className="flex items-center justify-between gap-3 pt-2"
              aria-label="Pagination"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={params.page <= 1 || loading}
                onClick={() => patch({ page: params.page - 1 })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {params.page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={params.page >= pages || loading}
                onClick={() => patch({ page: params.page + 1 })}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </>
      )}

      {loading && services.length > 0 ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
          Updating results…
        </p>
      ) : null}
    </div>
  );
}
