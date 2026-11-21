import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

export const ROLES = ["customer", "vendor", "admin"] as const;

export type Role = (typeof ROLES)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export const ROLE_HOME: Record<Role, string> = {
  customer: "/customer",
  vendor: "/vendor",
  admin: "/admin",
};

function toRole(value: unknown): Role {
  return value === "vendor" || value === "admin" ? value : "customer";
}

/**
 * Server-only session read. `cache()` dedupes the lookup within one request;
 * it deliberately does not persist the session in any server-side cache.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: toRole(session.user.role),
  };
});

export async function requireUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireRole(...allowed: Role[]): Promise<AuthUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}
