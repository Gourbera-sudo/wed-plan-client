import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { requireRole } from "@/lib/auth-guards";
import { getStoredProfile } from "@/lib/profile";

export const instant = false;

export const metadata = {
  title: "Admin Profile Settings",
};

export default async function AdminProfilePage() {
  const user = await requireRole("admin");
  const profile = await getStoredProfile(user.id);

  return <ProfileSettingsForm initial={profile} />;
}
