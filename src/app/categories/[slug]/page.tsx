import type { Metadata } from "next";
import { ArrowLeftIcon, ArrowUpRightIcon, SparklesIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/button-link";
import { Reveal } from "@/components/motion-reveal";
import { ServiceCard } from "@/components/service-card";
import { requireUser } from "@/lib/auth-guards";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { categoryNameFromSlug } from "@/lib/service-constants";
import { getServiceCategories, getServicesByCategory } from "@/lib/services";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryNameFromSlug(slug);

  return {
    title: category ? `${category} Wedding Services` : "Category Not Found",
  };
}

export default async function CategoryDetailPage({
  params,
}: PageProps<"/categories/[slug]">) {
  await requireUser();

  const { slug } = await params;
  const category = categoryNameFromSlug(slug);
  if (!category) notFound();

  const [services, categories] = await Promise.all([
    getServicesByCategory(category),
    getServiceCategories(),
  ]);
  const count =
    categories.find((item) => item.name === category)?.count ?? services.length;
  const Icon = CATEGORY_ICONS[category] ?? SparklesIcon;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
              <Icon className="size-3.5" aria-hidden="true" />
              Wedding service category
            </span>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {category}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {count} approved {count === 1 ? "service" : "services"} from WedPlan
              vendors. Compare options and open a listing to send a booking request.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/#service-categories" variant="outline" size="sm">
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              All categories
            </ButtonLink>
            <ButtonLink href="/services" size="sm">
              Browse all services
              <ArrowUpRightIcon className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </Reveal>

      {services.length === 0 ? (
        <Reveal className="mt-10">
          <p className="rounded-xl bg-secondary/70 px-6 py-10 text-center text-muted-foreground ring-1 ring-foreground/10">
            No approved services are available in this category yet.
          </p>
        </Reveal>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} className="h-full" delay={index * 0.05}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
