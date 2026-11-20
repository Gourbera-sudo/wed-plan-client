import Image from "next/image";
import { ArrowRightIcon, CheckIcon, HeartIcon, SparklesIcon } from "lucide-react";

import { ButtonLink } from "@/components/button-link";

export function Banner() {
  return (
    <section
      aria-labelledby="home-banner-title"
      className="overflow-hidden rounded-3xl bg-secondary/70 shadow-sm ring-1 ring-foreground/10"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            <SparklesIcon className="size-3.5" aria-hidden="true" />
            Wedding planning, made simple
          </span>

          <h1
            id="home-banner-title"
            className="mt-5 font-heading text-4xl leading-tight tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]"
          >
            Plan a wedding that feels like you.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover trusted wedding vendors, compare services, and keep every detail
            beautifully organized in one place.
          </p>

          <ButtonLink
            href="/services"
            size="lg"
            className="mt-8 h-11 w-fit px-5 shadow-sm sm:h-12 sm:px-6 sm:text-base"
          >
            Explore Wedding Services
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </ButtonLink>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CheckIcon className="size-4 text-primary" aria-hidden="true" />
              Verified local vendors
            </span>
            <span className="inline-flex items-center gap-2">
              <HeartIcon className="size-4 text-primary" aria-hidden="true" />
              Thoughtfully curated
            </span>
          </div>
        </div>

        <div className="relative min-h-80 overflow-hidden sm:min-h-96 lg:min-h-full">
          <Image
            src="/images/indian-wedding-couple.jpg"
            alt="A couple celebrating their wedding day"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-[center_30%]"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent lg:bg-gradient-to-r lg:from-background lg:via-background/20 lg:to-transparent" />
        </div>
      </div>
    </section>
  );
}
