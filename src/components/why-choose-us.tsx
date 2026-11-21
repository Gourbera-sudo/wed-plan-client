import {
  CalendarCheckIcon,
  HeartIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/motion-reveal";

const BENEFITS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ShieldCheckIcon,
    title: "Approved vendors",
    description: "Every listing is reviewed by our team before it reaches you.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Plan in one place",
    description: "Compare services, manage requests, and keep every detail together.",
  },
  {
    icon: WalletIcon,
    title: "Clear pricing",
    description: "See starting prices up front, with no surprises hidden in the details.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Easy booking requests",
    description: "Send a request in minutes and follow its status as it moves along.",
  },
];

export function WhyChooseWedPlan() {
  return (
    <section
      aria-labelledby="why-choose-title"
      className="mt-16 rounded-3xl bg-secondary/70 p-6 ring-1 ring-foreground/10 sm:mt-20 sm:p-10"
    >
      <Reveal className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
          <HeartIcon className="size-3.5" aria-hidden="true" />
          Why WedPlan
        </span>
        <h2
          id="why-choose-title"
          className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Why Choose WedPlan?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Planning a wedding should feel exciting, not overwhelming. We make it easier to find
          trusted vendors and stay organized from the first idea to the big day.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <Reveal key={benefit.title} delay={index * 0.07}>
              <div className="h-full rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-heading text-base font-medium">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
