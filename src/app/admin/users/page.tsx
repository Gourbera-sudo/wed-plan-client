import { AdminUsersManager } from "@/components/admin-users-manager";
import { requireRole } from "@/lib/auth-guards";

export const instant = false;

export const metadata = {
  title: "Manage Users",
};

export default async function AdminUsersPage() {
  const admin = await requireRole("admin");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Manage Users</h2>
        <p className="text-sm text-muted-foreground">
          Change roles and plans, or block accounts that break the rules.
        </p>
      </div>
      <AdminUsersManager currentUserId={admin.id} />
    </div>
  );
}
