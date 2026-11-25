import type { Metadata } from "next";
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { BookingForm } from "@/components/booking-form";
import { ButtonLink } from "@/components/button-link";
import { ServiceGallery } from "@/components/service-gallery";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  type AuthUser,
  requireUser,
} from "@/lib/auth-guards";
import { getServiceById, type ServiceDetail } from "@/lib/services";

export const instant = false;

export const metadata: Metadata = {
  title: "Service Details",
};

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function todayIso() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function VendorRow({ service }: { service: ServiceDetail }) {
  const initials = service.vendor.businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{service.vendor.businessName}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          by {service.vendor.name}
          {service.vendor.verified ? (
            <>
              <BadgeCheckIcon
                className="size-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="sr-only">Verified vendor</span>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}

function BookingArea({
  service,
  user,
}: {
  service: ServiceDetail;
  user: AuthUser;
}) {
  if (user.role === "admin") {
    return (
      <div className="rounded-lg bg-muted/60 p-4 text-sm ring-1 ring-foreground/10">
        <p className="font-medium">Booking is for customers</p>
        <p className="mt-1 text-muted-foreground">
          Admin accounts cannot submit customer booking requests.
        </p>
        <ButtonLink href="/admin" variant="link" size="sm" className="mt-2 -ml-2">
          Go to admin dashboard
        </ButtonLink>
      </div>
    );
  }

  if (user.role === "vendor") {
    const isOwnService = Boolean(service.vendorId) && service.vendorId === user.id;

    return (
      <div className="rounded-lg bg-muted/60 p-4 text-sm ring-1 ring-foreground/10">
        <p className="font-medium">
          {isOwnService ? "This is your listing" : "Vendors don't book services"}
        </p>
        <p className="mt-1 text-muted-foreground">
          {isOwnService
            ? "You can't send a booking request for your own service. Manage it from your vendor dashboard."
            : "Switch to a customer account to send a booking request."}
        </p>
        <ButtonLink href="/vendor" variant="link" size="sm" className="mt-2 -ml-2">
          Go to vendor dashboard
        </ButtonLink>
      </div>
    );
  }

  return <BookingForm serviceId={service.id} minDate={todayIso()} />;
}

function UnavailableState() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <Alert variant="destructive" className="p-5">
        <TriangleAlertIcon aria-hidden="true" />
        <AlertTitle className="text-base">Service unavailable</AlertTitle>
        <AlertDescription>
          We couldn&apos;t find this service. The link may be incorrect, or the
          listing is no longer approved and active.
        </AlertDescription>
      </Alert>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/services">Browse all services</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}

export default async function ServiceDetailsPage({
  params,
}: PageProps<"/services/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) return <UnavailableState />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
      <ButtonLink
        href="/services"
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Back to services
      </ButtonLink>

      <header className="mb-8 max-w-3xl">
        <Badge variant="secondary">{service.category}</Badge>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {service.name}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
          <ShieldCheckIcon
            className="size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          Approved by WedPlan
        </p>
        {service.location ? (
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPinIcon
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            {service.location}
          </p>
        ) : null}
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-10">
        <div className="min-w-0">
          <ServiceGallery images={service.images} name={service.name} />

          <section aria-labelledby="about-service-title" className="mt-10">
            <h2
              id="about-service-title"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              About this service
            </h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-muted-foreground">
              {service.description ||
                "This vendor hasn't added a description yet. Send a request to learn more about what's included."}
            </p>
          </section>

          <section
            aria-labelledby="booking-details-title"
            className="mt-8 rounded-xl bg-secondary/60 p-5 text-sm ring-1 ring-foreground/10"
          >
            <h2 id="booking-details-title" className="font-medium">
              Booking details
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDaysIcon
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  Event types
                </p>
                {service.eventTypes?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {service.eventTypes.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Flexible — tell the vendor what you&apos;re planning.
                  </p>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Availability</p>
                {service.availability?.length ? (
                  <ul className="space-y-1 text-muted-foreground">
                    {service.availability.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Flexible dates</p>
                )}
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-muted-foreground">
              <ShieldCheckIcon
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              Reviewed and approved by WedPlan
            </p>
          </section>
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="mt-0.5 font-heading text-3xl font-semibold">
                {priceFormatter.format(service.price)}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="font-heading text-sm font-medium text-muted-foreground">
                Vendor information
              </h2>
              <div className="mt-3">
                <VendorRow service={service} />
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="font-heading text-lg font-medium">
                Request this service
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Share your event details and the vendor will get back to you.
              </p>
              <div className="mt-4">
                <BookingArea service={service} user={user} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
