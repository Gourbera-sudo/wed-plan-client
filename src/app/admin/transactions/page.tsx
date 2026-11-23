import { AdminTransactions } from "@/components/admin-transactions";

export const metadata = {
  title: "Transactions",
};

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Transactions</h2>
        <p className="text-sm text-muted-foreground">
          Review subscription payments. UPI payments activate premium only after approval.
        </p>
      </div>
      <AdminTransactions />
    </div>
  );
}
