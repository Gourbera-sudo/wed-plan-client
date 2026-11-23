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

// Six approved + active Indian-wedding listings, one per required category.
// Photos are verified Unsplash images of Indian ceremonies, venues, decor,
// food, bridal styling and lehengas. The last two are deliberately excluded
// so the moderation filters can be verified.
const services = [
  {
    slug: "city-palace-courtyard",
    name: "The City Palace Courtyard",
    category: "Wedding Venues",
    description:
      "Exchange vows beneath the marble courtyards of a heritage Rajasthan palace, with Lake Pichola as your backdrop. Our team handles the mandap setup, guest seating, and evening lighting so your celebration feels straight out of a royal procession.",
    price: 3200,
    location: "Udaipur, Rajasthan",
    image: image("photo-1749297670102-781b0c3d3203"),
    images: gallery(
      "photo-1749297670102-781b0c3d3203",
      "photo-1774024051129-90d3fb8e30fe",
      "photo-1744805624954-a6686543c3ff",
    ),
    vendorName: "Ananya Sharma",
    vendorBusinessName: "Royal Rajasthan Venues",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "mandap-moments-studio",
    name: "Mandap Moments Studio",
    category: "Photography & Videography",
    description:
      "Documentary photography and film for the whole wedding weekend, from the mehendi morning to the last sangeet song. We capture the quiet rituals and the loud celebrations with equal care, and deliver a curated gallery within four weeks.",
    price: 1850,
    location: "Jaipur, Rajasthan",
    image: image("photo-1774024051129-90d3fb8e30fe"),
    images: gallery(
      "photo-1774024051129-90d3fb8e30fe",
      "photo-1760080839074-07e553b0565e",
      "photo-1724856604254-f7cf4e9c8f72",
    ),
    vendorName: "Rohan Mehta",
    vendorBusinessName: "Mandap Moments",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "marigold-and-bloom",
    name: "Marigold & Bloom Decor",
    category: "Decoration & Florist",
    description:
      "Handcrafted mandaps, marigold garlands, rangoli, and reception arrangements built around your colour palette. From the haldi canopy to the sangeet stage, our florists handle every petal so you can simply enjoy the day.",
    price: 1200,
    location: "Mumbai, Maharashtra",
    image: image("photo-1744805624954-a6686543c3ff"),
    images: gallery(
      "photo-1744805624954-a6686543c3ff",
      "photo-1667889244689-d65615feb2a6",
      "photo-1744804298523-9e4ddf5e6dc4",
    ),
    vendorName: "Priya Nair",
    vendorBusinessName: "Marigold & Bloom",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "thali-table-catering",
    name: "The Thali Table Catering",
    category: "Catering Services",
    description:
      "Regional Indian menus, live counters, and full service for weddings of every size. Our chefs prepare everything from slow-simmered curries to fresh breads, then plate and serve with the warmth of a family feast.",
    price: 2400,
    location: "Delhi, NCR",
    image: image("photo-1789994405563-b372d9a270c2"),
    images: gallery(
      "photo-1789994405563-b372d9a270c2",
      "photo-1789993494863-437bee68f8e6",
      "photo-1667889244689-d65615feb2a6",
    ),
    vendorName: "Vikram Sethi",
    vendorBusinessName: "The Thali Table",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "bridal-glow-atelier",
    name: "Bridal Glow Atelier",
    category: "Makeup & Styling",
    description:
      "Hair, makeup, and jewellery styling for the couple and the whole wedding party. We start with a preview session so the day itself feels calm, and stay on site for touch-ups from the mehendi through the vidai.",
    price: 750,
    location: "Bengaluru, Karnataka",
    image: image("photo-1781077126479-437220427c93"),
    images: gallery(
      "photo-1781077126479-437220427c93",
      "photo-1771992226261-c1efb190ed34",
      "photo-1759906760638-eeffcb471e53",
    ),
    vendorName: "Meera Iyer",
    vendorBusinessName: "Bridal Glow Atelier",
    vendorVerified: true,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "red-lehenga-atelier",
    name: "The Red Lehenga Atelier",
    category: "Wedding Fashion",
    description:
      "Hand embroidered lehengas, sherwanis, and fittings for the whole wedding party. Our stylists help you find pieces that feel true to you, then handle alterations and delivery so everything fits perfectly on the day.",
    price: 2100,
    location: "Hyderabad, Telangana",
    image: image("photo-1724856605022-106d6dd6e842"),
    images: gallery(
      "photo-1724856605022-106d6dd6e842",
      "photo-1759906760638-eeffcb471e53",
      "photo-1760080839074-07e553b0565e",
    ),
    vendorName: "Kavya Reddy",
    vendorBusinessName: "The Red Lehenga Atelier",
    vendorVerified: false,
    isApproved: true,
    isActive: true,
    featured: true,
  },
  {
    slug: "coastal-mandap-venue",
    name: "Coastal Mandap Venue",
    category: "Wedding Venues",
    description: "Pending admin review.",
    price: 2800,
    location: "Goa",
    image: image("photo-1744804298523-9e4ddf5e6dc4"),
    images: gallery(
      "photo-1744804298523-9e4ddf5e6dc4",
      "photo-1749297670102-781b0c3d3203",
    ),
    vendorName: "Ishaan Desai",
    vendorBusinessName: "Coastal Celebrations",
    vendorVerified: false,
    isApproved: false,
    isActive: true,
    featured: true,
  },
  {
    slug: "heritage-film-co",
    name: "Heritage Film Co.",
    category: "Photography & Videography",
    description: "Paused by the vendor.",
    price: 1400,
    location: "Kolkata, West Bengal",
    image: image("photo-1760080839074-07e553b0565e"),
    images: gallery(
      "photo-1760080839074-07e553b0565e",
      "photo-1774024051129-90d3fb8e30fe",
    ),
    vendorName: "Arjun Bose",
    vendorBusinessName: "Heritage Film Co.",
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
          // getFeaturedServices() sorts by `order` ascending. Negative values
          // keep these curated Indian-wedding listings in the home page's
          // first six cards ahead of any other demo data in the collection.
          order: index - 6,
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
