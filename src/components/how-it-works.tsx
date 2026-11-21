import {
  MessageCircleIcon,
  PartyPopperIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/motion-reveal";

const STEPS: { number: string; icon: LucideIcon; title: string; description: string }[] = [
  {
    number: "01",
    icon: SearchIcon,
    title: "Discover",
    description: "Browse approved services and narrow them down by category, price, and location.",
  },
  {
    number: "02",
    icon: MessageCircleIcon,
    title: "Connect",
    description: "View full details, compare vendors, and send a booking request with your event plans.",
  },
  {
    number: "03",
    icon: PartyPopperIcon,
    title: "Celebrate",
    description: "Track every request in your dashboard and get ready to enjoy your day.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title" className="mt-16 sm:mt-20">
      <Reveal className="max-w-2xl">
        <span className="text-xs font-medium tracking-wide text-primary uppercase">
          Simple by design
        </span>
        <h2
          id="how-it-works-title"
          className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          How WedPlan Works
        </h2>
        <p className="mt-2 text-muted-foreground">
          Three easy steps from browsing your first venue to booking the whole celebration.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <Reveal key={step.number} delay={index * 0.08}>
              <div className="h-full border-t-2 border-primary/30 pt-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {step.number}
                  </span>
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-medium">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
