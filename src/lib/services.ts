import { cacheLife, cacheTag } from "next/cache";
import { ObjectId } from "mongodb";

import { getDatabase } from "@/lib/mongodb";

export {
  SERVICE_CATEGORY_ORDER,
  type FeaturedService,
  type ServiceDetail,
  type ServiceCategoryName,
} from "@/lib/service-constants";
import { SERVICE_CATEGORY_ORDER } from "@/lib/service-constants";
import type { FeaturedService, ServiceDetail } from "@/lib/service-constants";

/**
 * Shape of a document in the `services` collection. Vendor details are
 * denormalized onto the listing so cards can render without an extra lookup.
 */
type ServiceDocument = {
  _id: ObjectId;
  name: string;
  category: string;
  price: number;
  location: string;
  image: string;
  images?: string[];
  description?: string;
  vendorId?: string;
  vendorName: string;
  vendorBusinessName: string;
  vendorVerified?: boolean;
  isApproved: boolean;
  isActive: boolean;
  featured?: boolean;
  order?: number;
  createdAt?: Date;
};

export const FEATURED_SERVICE_LIMIT = 6;

export type ServiceCategory = {
  name: string;
  count: number;
};

function toFeaturedService(doc: ServiceDocument): FeaturedService {
  return {
    id: String(doc._id),
    name: doc.name,
    category: doc.category,
    price: doc.price,
    location: doc.location,
    image: doc.images?.[0] ?? doc.image,
    vendor: {
      name: doc.vendorName,
      businessName: doc.vendorBusinessName,
      verified: doc.vendorVerified ?? false,
    },
  };
}

/**
 * Featured listings for the home page. Only approved, active services are
 * eligible; featured listings are ordered first, then by curated order.
 *
 * Cached so the cards are part of the prerendered home page. Tagged so an
 * admin moderation change can invalidate them with `revalidateTag("services")`.
 */
export async function getFeaturedServices(
  limit: number = FEATURED_SERVICE_LIMIT,
): Promise<FeaturedService[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  const services = getDatabase().collection<ServiceDocument>("services");
  const docs = await services
    .find({ isApproved: true, isActive: true })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map(toFeaturedService);
}

/** Approved, active listings for one category detail page. */
export async function getServicesByCategory(
  category: string,
): Promise<FeaturedService[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  const services = getDatabase().collection<ServiceDocument>("services");
  const docs = await services
    .find({ isApproved: true, isActive: true, category })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .toArray();

  return docs.map(toFeaturedService);
}

/**
 * Categories with at least one approved, active listing. Derived from the
 * services collection so no duplicate category collection is needed.
 */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  const rows = await getDatabase()
    .collection<ServiceDocument>("services")
    .aggregate<{ _id: string; count: number }>([
      { $match: { isApproved: true, isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray();

  const rank = (name: string) => {
    const index = SERVICE_CATEGORY_ORDER.indexOf(
      name as (typeof SERVICE_CATEGORY_ORDER)[number],
    );
    return index === -1 ? SERVICE_CATEGORY_ORDER.length : index;
  };

  return rows
    .map((row) => ({ name: row._id, count: row.count }))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

/**
 * Full details for one listing. Invalid IDs and anything that is not both
 * approved and active resolve to `null` so the page can show a clear error.
 */
export async function getServiceById(id: string): Promise<ServiceDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;

  const doc = await getDatabase()
    .collection<ServiceDocument>("services")
    .findOne({ _id: new ObjectId(id), isApproved: true, isActive: true });

  if (!doc) return null;

  return {
    ...toFeaturedService(doc),
    description: doc.description ?? "",
    images: doc.images?.length ? doc.images : [doc.image],
    vendorId: doc.vendorId ?? "",
  };
}
