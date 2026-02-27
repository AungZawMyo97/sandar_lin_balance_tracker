import { getCurrentUser } from "@/lib/session";
import { AccountService } from "@/app/services/accountService";
import { SupplierService } from "@/app/services/supplierService";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { redirect } from "next/navigation";

export default async function CreateTransactionPage() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const accounts = await AccountService.getUserAccounts(parseInt(userId));
  const suppliers = await SupplierService.getAll();

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Exchange Currency
        </h1>
        <p className="text-muted-foreground">
          Record a buy or sell transaction.
        </p>
      </div>
      <TransactionForm accounts={accounts} suppliers={suppliers} />
    </div>
  );
}
