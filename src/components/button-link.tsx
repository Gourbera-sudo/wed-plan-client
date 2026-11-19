import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/**
 * Navigation that looks like a button.
 *
 * Base UI's Button adds `role="button"` when rendered as an anchor, so links
 * use the button styles directly instead.
 */
export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
