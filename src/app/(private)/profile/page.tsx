import { DashboardPlaceholder } from "@/components/dashboard-placeholder";
import { requireUser } from "@/lib/auth-guards";

export const instant = false;

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <DashboardPlaceholder
        title="Profile Settings"
        description="Manage how your profile appears across WedPlan."
        items={[
          `Signed in as ${user.name}`,
          `Email: ${user.email}`,
          "Profile editing will be available in a future update.",
        ]}
      />
    </div>
  );
}
