import { redirect } from "next/navigation";

import { requireUser, ROLE_HOME } from "@/lib/auth-guards";

export default async function DashboardPage() {
  const user = await requireUser();
  redirect(ROLE_HOME[user.role]);
}
