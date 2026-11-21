import { DashboardPlaceholder } from "@/components/dashboard-placeholder";

export const metadata = {
  title: "Transactions",
};

export default function AdminTransactionsPage() {
  return (
    <DashboardPlaceholder
      title="Transactions"
      description="Track payments, payouts, and refunds."
      items={[
        "Filter payments by date, vendor, or status",
        "Review subscription revenue and payouts",
        "Export transaction history for accounting",
      ]}
    />
  );
}
