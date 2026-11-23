import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { requireUser } from "@/lib/auth-guards";
import { getStoredProfile } from "@/lib/profile";

export const instant = false;

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getStoredProfile(user.id);

  return <ProfileSettingsForm initial={profile} />;
}
