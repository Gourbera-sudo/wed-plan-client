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
