import { ObjectId } from "mongodb";

import { getDatabase } from "@/lib/mongodb";

export type StoredProfile = {
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  phone: string | null;
  businessName: string | null;
};

/** Server-only read of the editable profile fields for the signed-in user. */
export async function getStoredProfile(userId: string): Promise<StoredProfile> {
  const doc = await getDatabase().collection("user").findOne(
    { _id: new ObjectId(userId) },
    {
      projection: {
        name: 1,
        email: 1,
        image: 1,
        bio: 1,
        phone: 1,
        businessName: 1,
      },
    },
  );

  if (!doc) throw new Error("Account no longer exists.");

  const text = (value: unknown) => (typeof value === "string" ? value : null);
  return {
    name: text(doc.name) ?? "",
    email: text(doc.email) ?? "",
    image: text(doc.image),
    bio: text(doc.bio),
    phone: text(doc.phone),
    businessName: text(doc.businessName),
  };
}
