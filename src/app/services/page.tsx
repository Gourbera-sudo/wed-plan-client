import type { Metadata } from "next";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Browse Services",
};

const SERVICES = [
  {
    name: "Venues",
    description: "Ceremony and reception spaces for every guest count and season.",
  },
  {
    name: "Photography",
    description: "Photographers and videographers to capture the day as it happens.",
  },
  {
    name: "Catering",
    description: "Menus, tastings, and bar service from local caterers.",
  },
  {
    name: "Florists",
    description: "Bouquets, ceremony arches, and table arrangements.",
  },
  {
    name: "Music & Entertainment",
    description: "Bands, DJs, and ceremony musicians.",
  },
  {
    name: "Beauty & Attire",
    description: "Hair, makeup, and styling for the couple and wedding party.",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Browse Services</h1>
        <p className="mt-2 text-muted-foreground">
          Explore trusted vendors by category. Listings are coming soon.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <Card key={service.name}>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
