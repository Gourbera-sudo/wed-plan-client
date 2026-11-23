import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { requireRole } from "@/lib/auth-guards";
import { getStoredProfile } from "@/lib/profile";

export const instant = false;

export const metadata = {
  title: "Vendor Profile Settings",
};

export default async function VendorProfilePage() {
  const user = await requireRole("vendor");
  const profile = await getStoredProfile(user.id);

  return <ProfileSettingsForm initial={profile} showBusinessName />;
}
