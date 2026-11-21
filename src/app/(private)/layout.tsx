import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth-guards";

export const instant = false;

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
