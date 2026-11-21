import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const separator = line.indexOf("=");
      return [
        line.slice(0, separator),
        line.slice(separator + 1).replace(/^["']|["']$/g, ""),
      ];
    }),
);

const uri = env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set in .env");

const image = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const gallery = (...ids) => ids.map(image);

// Six approved + active listings, one per required category. The last two are
// deliberately excluded so the moderation filters can be verified.
const services = [
  {
    slug: "the-willow-house",
    name: "The Willow House",
    category: "Wedding Venues",
    description:
      "A light-filled garden estate for ceremonies and receptions. Exchange vows under the old willow tree, then gather under string lights for dinner and dancing. The grounds, getting-ready suites, and on-site coordinator are all included in every booking.",
    price: 3200,
    location: "Nashville, TN",
    image: image("photo-1519741497674-611481863552"),
    images: gallery(
      "photo-1519741497674-611481863552",
      "photo-1519225421980-715cb0215aed",
      "photo-1469371670807-013ccf25f16a",
    ),
    vendorName: "Olivia Bennett",
    vendorBusinessName: "Willow Events",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "golden-hour-studio",
    name: "Golden Hour Portraits",
    category: "Photography & Videography",
    description:
      "Documentary-style photography and film for the whole weekend. We capture the quiet moments as carefully as the big ones, from the first look to the last song, and deliver a curated gallery within four weeks.",
    price: 1850,
    location: "New York, NY",
    image: image("photo-1511285560929-80b456fea0bc"),
    images: gallery(
      "photo-1511285560929-80b456fea0bc",
      "photo-1524504388940-b1c1722653e1",
      "photo-1487412720507-e7ab37603c6f",
    ),
    vendorName: "Noah Patel",
    vendorBusinessName: "Golden Hour Studio",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "petal-and-stem",
    name: "Petal & Stem Florals",
    category: "Decoration & Florist",
    description:
      "Hand-tied bouquets, ceremony arches, and reception arrangements built around what is in season. We work closely with you on a palette that feels like your celebration, then handle every petal on the day.",
    price: 1200,
    location: "San Francisco, CA",
    image: image("photo-1537633552985-df8429e8048b"),
    images: gallery(
      "photo-1537633552985-df8429e8048b",
      "photo-1519225421980-715cb0215aed",
      "photo-1465495976277-4387d4b0b4c6",
    ),
    vendorName: "Isla Moreno",
    vendorBusinessName: "Petal & Stem",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "sage-and-salt",
    name: "Sage & Salt Catering",
    category: "Catering Services",
    description:
      "Seasonal menus, tastings, and full bar service for weddings of every size. Our chefs source from local growers, and our team plates and serves with the same care you would expect at a restaurant.",
    price: 2400,
    location: "Chicago, IL",
    image: image("photo-1414235077428-338989a2e8c0"),
    images: gallery(
      "photo-1414235077428-338989a2e8c0",
      "photo-1546039907-7fa05f864c02",
      "photo-1470337458703-46ad1756a187",
    ),
    vendorName: "Amara Reed",
    vendorBusinessName: "Sage & Salt Catering",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "glow-bridal-atelier",
    name: "Bridal Glow Atelier",
    category: "Makeup & Styling",
    description:
      "Hair, makeup, and styling for the couple and wedding party. We start with a preview session so the day itself feels calm, and we stay on site for touch-ups through the first dance.",
    price: 750,
    location: "Miami, FL",
    image: image("photo-1595476108010-b4d1f102b1b1"),
    images: gallery(
      "photo-1595476108010-b4d1f102b1b1",
      "photo-1512316609839-ce289d3eba0a",
      "photo-1524504388940-b1c1722653e1",
    ),
    vendorName: "Mia Torres",
    vendorBusinessName: "Glow Bridal Atelier",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "threads-and-veil",
    name: "Threads & Veil Bridal",
    category: "Wedding Fashion",
    description:
      "Gowns, suits, and fittings for the whole wedding party. Our stylists help you find pieces that feel true to you, then handle alterations and delivery so everything fits perfectly on the day.",
    price: 2100,
    location: "Los Angeles, CA",
    image: image("photo-1522673607200-164d1b6ce486"),
    images: gallery(
      "photo-1522673607200-164d1b6ce486",
      "photo-1483985988355-763728e1935b",
      "photo-1469371670807-013ccf25f16a",
    ),
    vendorName: "Elena Brooks",
    vendorBusinessName: "Threads & Veil",
    vendorVerified: false,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "hidden-garden-venue",
    name: "Hidden Garden Venue",
    category: "Wedding Venues",
    description: "Pending admin review.",
    price: 2800,
    location: "Portland, OR",
    image: image("photo-1465495976277-4387d4b0b4c6"),
    images: gallery(
      "photo-1465495976277-4387d4b0b4c6",
      "photo-1519225421980-715cb0215aed",
    ),
    vendorName: "Clara Hughes",
    vendorBusinessName: "Hidden Garden",
    vendorVerified: false,
    isApproved: false,
    isActive: true,
    featured: true,
  },
  {
    slug: "vintage-film-co",
    name: "Vintage Film Co.",
    category: "Photography & Videography",
    description: "Paused by the vendor.",
    price: 1400,
    location: "Denver, CO",
    image: image("photo-1507504031003-b417219a0fde"),
    images: gallery(
      "photo-1507504031003-b417219a0fde",
      "photo-1511285560929-80b456fea0bc",
    ),
    vendorName: "Leo Brooks",
    vendorBusinessName: "Vintage Film Co.",
    vendorVerified: false,
    isApproved: true,
    isActive: false,
    featured: true,
  },
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const collection = client.db("wed-plan").collection("services");

  // Remove only demo records this script owns, leaving real vendor listings alone.
  await collection.deleteMany({ seedMarker: "wedplan-demo" });

  for (const [index, service] of services.entries()) {
    await collection.updateOne(
      { slug: service.slug },
      {
        $set: {
          ...service,
          seedMarker: "wedplan-demo",
          order: index,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  const approvedActive = await collection.countDocuments({
    isApproved: true,
    isActive: true,
  });
  console.log(
    `Seeded ${services.length} services (${approvedActive} approved + active).`,
  );
} finally {
  await client.close();
}
