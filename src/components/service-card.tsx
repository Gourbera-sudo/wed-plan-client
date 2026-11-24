import Image from "next/image";
import { ArrowUpRightIcon, BadgeCheckIcon, MapPinIcon } from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeaturedService } from "@/lib/services";

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function ServiceVendorRow({
  vendor,
  bordered = true,
}: {
  vendor: FeaturedService["vendor"];
  bordered?: boolean;
}) {
  const initials = vendor.businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`flex items-center gap-3 ${bordered ? "border-t pt-4" : ""}`}>
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

/** Shared listing card used by the home page and the browse page. */
export function ServiceCard({ service }: { service: FeaturedService }) {
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
          <ServiceVendorRow vendor={service.vendor} />
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
