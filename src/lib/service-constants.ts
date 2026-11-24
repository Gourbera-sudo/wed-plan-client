/**
 * Client-safe service constants — no server-only imports (Mongo, next/cache),
 * so browser components can use them without pulling the driver into the bundle.
 */

/** Canonical ordering for the public category explorer. */
export const SERVICE_CATEGORY_ORDER = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
] as const;

export type ServiceCategoryName =
  (typeof SERVICE_CATEGORY_ORDER)[number];

/** URL-safe slug used by the dedicated category detail pages. */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolves a route slug back to a canonical category name. */
export function categoryNameFromSlug(slug: string): ServiceCategoryName | null {
  return (
    SERVICE_CATEGORY_ORDER.find((name) => categorySlug(name) === slug) ?? null
  );
}

/** Public, serializable shape used by listing cards. */
export type FeaturedService = {
  id: string;
  name: string;
  category: string;
  price: number;
  location: string;
  image: string;
  vendor: {
    name: string;
    businessName: string;
    verified: boolean;
  };
};

/** Full, serializable shape used by the service details page. */
export type ServiceDetail = Omit<FeaturedService, "image"> & {
  description: string;
  images: string[];
  vendorId: string;
};
