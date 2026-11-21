import {
  ArrowUpRightIcon,
  Building2Icon,
  CameraIcon,
  Flower2Icon,
  ShirtIcon,
  SparklesIcon,
  UtensilsCrossedIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion-reveal";
import { getServiceCategories } from "@/lib/services";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Photography & Videography": CameraIcon,
  "Wedding Venues": Building2Icon,
  "Decoration & Florist": Flower2Icon,
  "Catering Services": UtensilsCrossedIcon,
  "Makeup & Styling": SparklesIcon,
  "Wedding Fashion": ShirtIcon,
};

/** Section 2 — categories are derived from approved, active listings. */
export async function ServiceCategories() {
  const categories = await getServiceCategories();

  return (
    <section aria-labelledby="service-categories-title" className="mt-16 sm:mt-20">
      <Reveal className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
          <SparklesIcon className="size-3.5" aria-hidden="true" />
          Explore by category
        </span>
        <h2
          id="service-categories-title"
          className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Wedding Service Categories
        </h2>
        <p className="mt-2 text-muted-foreground">
          From the first photo to the final toast, find the right people for every part of your day.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICONS[category.name] ?? SparklesIcon;

          return (
            <Reveal key={category.name} className="h-full" delay={index * 0.05}>
              <Link
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="group flex h-full items-center gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition duration-300 hover:-translate-y-0.5 hover:ring-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-base font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.count} {category.count === 1 ? "service" : "services"}
                  </span>
                </span>
                <ArrowUpRightIcon
                  className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
