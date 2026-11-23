import { AdminServicesManager } from "@/components/admin-services-manager";

export const metadata = {
  title: "Manage Services",
};

export default function AdminServicesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Manage Services</h2>
        <p className="text-sm text-muted-foreground">
          Approve or reject vendor listings. Only approved services appear in browse.
        </p>
      </div>
      <AdminServicesManager />
    </div>
  );
}
