import Link from "next/link";
import { HeartIcon, SparklesIcon } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile Settings" },
] as const;

const GET_STARTED_LINKS = [
  { href: "/sign-up", label: "Create an account" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/vendor/services/new", label: "List your services" },
] as const;

const HIGHLIGHTS = [
  "Compare trusted wedding vendors",
  "Request bookings in one place",
  "Track every detail from your dashboard",
] as const;

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

          <nav aria-label="Explore">
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

          <nav aria-label="Get started">
            <h2 className="font-heading text-sm font-semibold text-primary">Get started</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {GET_STARTED_LINKS.map((link) => (
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
            <h2 className="font-heading text-sm font-semibold text-primary">One calm place</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              From the first shortlist to the final confirmation, WedPlan keeps the whole wedding in
              view.
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {HIGHLIGHTS.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <SparklesIcon
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {highlight}
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
