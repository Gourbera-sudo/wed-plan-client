import Image from "next/image";
import { ArrowUpRightIcon, BadgeCheckIcon, MapPinIcon, SparklesIcon } from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { Reveal } from "@/components/motion-reveal";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFeaturedServices, type FeaturedService } from "@/lib/services";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function VendorRow({ vendor }: { vendor: FeaturedService["vendor"] }) {
  const initials = vendor.businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 border-t pt-4">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{vendor.businessName}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          by {vendor.name}
          {vendor.verified ? (
            <>
              <BadgeCheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="sr-only">Verified vendor</span>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: FeaturedService }) {
  return (
    <Card className="h-full">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground shadow-sm backdrop-blur-sm">
          {service.category}
        </Badge>
      </div>

      <CardHeader className="gap-1.5">
        <CardTitle className="text-lg">{service.name}</CardTitle>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="size-4 shrink-0" aria-hidden="true" />
          {service.location}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">Starting at</span>
          <span className="font-heading text-xl font-semibold">
            {priceFormatter.format(service.price)}
          </span>
        </p>
        <div className="mt-auto">
          <VendorRow vendor={service.vendor} />
        </div>
      </CardContent>

      <CardFooter>
        <ButtonLink
          href={`/services/${service.id}`}
          size="sm"
          className="w-full justify-between"
        >
          View Details
          <ArrowUpRightIcon className="size-4" aria-hidden="true" />
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}

/** Section 1 of the home page — listings come from the `services` collection. */
export async function FeaturedServices() {
  const services = await getFeaturedServices();

  return (
    <section aria-labelledby="featured-services-title" className="mt-14 sm:mt-18">
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
            <SparklesIcon className="size-3.5" aria-hidden="true" />
            Curated for your day
          </span>
          <h2
            id="featured-services-title"
            className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Featured Wedding Services
          </h2>
          <p className="mt-2 text-muted-foreground">
            Trusted local vendors, approved by our team and ready to make your celebration yours.
          </p>
        </div>
        <ButtonLink href="/services" variant="outline" size="sm" className="w-fit shrink-0">
          Browse all services
          <ArrowUpRightIcon className="size-4" aria-hidden="true" />
        </ButtonLink>
      </Reveal>

      {services.length === 0 ? (
        <p className="mt-8 rounded-xl bg-secondary/70 px-6 py-10 text-center text-muted-foreground ring-1 ring-foreground/10">
          Featured services will appear here once vendors are approved.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} className="h-full" delay={index * 0.06}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
