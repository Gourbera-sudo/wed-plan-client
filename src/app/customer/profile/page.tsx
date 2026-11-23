import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { requireRole } from "@/lib/auth-guards";
import { getStoredProfile } from "@/lib/profile";

export const instant = false;

export const metadata = {
  title: "Customer Profile Settings",
};

export default async function CustomerProfilePage() {
  const user = await requireRole("customer");
  const profile = await getStoredProfile(user.id);

  return <ProfileSettingsForm initial={profile} />;
}
