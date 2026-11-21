import type { ComponentType } from "react";

import Link from "next/link";
import { ClockIcon, HeartIcon, MailIcon, PhoneIcon } from "lucide-react";

// Demo values — replace with the real WedPlan contact details and social URLs.
const CONTACT = {
  email: "hello@wedplan.com",
  phone: "+919732010243",
  phoneHref: "tel:+919732010243",
  hours: "Mon-Fri, 9:00 AM - 6:00 PM",
} as const;

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile Settings" },
] as const;

type SocialIconProps = { className?: string };

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PinterestIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-1.9 0-2.7l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.8 0 1.2.6 1.2 1.4 0 .8-.5 2.1-.8 3.2-.2.9.5 1.6 1.4 1.6 1.7 0 3-1.8 3-4.4 0-2.3-1.6-3.9-4-3.9-2.7 0-4.3 2-4.3 4.2 0 .8.3 1.7.7 2.2.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.4.1-1.5-.7-2.4-2.9-2.4-4.7 0-3.8 2.8-7.3 8-7.3 4.2 0 7.4 3 7.4 7 0 4.2-2.6 7.5-6.3 7.5-1.2 0-2.4-.6-2.8-1.4l-.8 2.9c-.3 1-1 2.3-1.5 3.2A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17.5V3.6a22 22 0 0 0-3.2-.1c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8h3.2Z" />
    </svg>
  );
}

const SOCIAL_LINKS: readonly {
  name: string;
  href: string;
  icon: ComponentType<SocialIconProps>;
}[] = [
  { name: "Instagram", href: "https://www.instagram.com/wedplan", icon: InstagramIcon },
  { name: "Pinterest", href: "https://www.pinterest.com/wedplan", icon: PinterestIcon },
  { name: "Facebook", href: "https://www.facebook.com/wedplan", icon: FacebookIcon },
];

export async function Footer() {
  "use cache";

  const copyrightYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 font-heading text-lg font-semibold tracking-tight"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HeartIcon className="size-4" aria-hidden="true" />
              </span>
              <span>WedPlan</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Find trusted wedding vendors, keep every detail in one place, and actually enjoy the
              planning.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-heading text-sm font-semibold text-primary">Explore</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-heading text-sm font-semibold text-primary">Get in touch</h2>
            <address className="mt-4 flex flex-col gap-3 text-sm not-italic text-muted-foreground">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-start gap-2 transition-colors hover:text-primary"
              >
                <MailIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{CONTACT.email}</span>
              </a>
              <a
                href={CONTACT.phoneHref}
                className="flex items-start gap-2 transition-colors hover:text-primary"
              >
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{CONTACT.phone}</span>
              </a>
              <p className="flex items-start gap-2">
                <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{CONTACT.hours}</span>
              </p>
            </address>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="font-heading text-sm font-semibold text-primary">Follow along</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Ideas, inspiration, and vendor spotlights.
            </p>
            <ul className="mt-4 flex gap-2">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    aria-label={`WedPlan on ${name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {copyrightYear} WedPlan. All rights reserved.</p>
          <p>Plan a wedding that feels like you.</p>
        </div>
      </div>
    </footer>
  );
}
