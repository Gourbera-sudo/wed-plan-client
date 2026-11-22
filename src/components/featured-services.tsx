import { ArrowUpRightIcon, SparklesIcon } from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { Reveal } from "@/components/motion-reveal";
import { ServiceCard } from "@/components/service-card";
import { getFeaturedServices } from "@/lib/services";

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
