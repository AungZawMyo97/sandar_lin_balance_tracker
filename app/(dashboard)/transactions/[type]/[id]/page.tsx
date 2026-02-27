import { getCurrentUser } from "@/lib/session";
import { TransactionService } from "@/app/services/transactionService";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Printer, Calendar, ArrowRight, Wallet, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default async function TransactionDetailsPage({ params }: Props) {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const resolvedParams = await params;
  const type = resolvedParams.type.toUpperCase() as "STANDARD" | "CROSS";
  const id = parseInt(resolvedParams.id);

  if (!["STANDARD", "CROSS"].includes(type) || isNaN(id)) {
    redirect("/transactions");
  }

  const txn = await TransactionService.getTransaction(
    parseInt(userId),
    id,
    type
  );

  if (!txn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-muted-foreground">
          Transaction not found
        </h2>
        <Link href="/transactions">
          <Button>Go Back</Button>
        </Link>
      </div>
    );
  }

  const isCross = txn.kind === "CROSS";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <Button variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </div>

      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-slate-50 border-b pb-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                Transaction #{txn.id}
                <Badge
                  variant={isCross ? "secondary" : "default"}
                  className="ml-2"
                >
                  {isCross ? "CROSS" : "EXCHANGE"}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {format(
                  new Date(txn.createdAt),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </CardDescription>
            </div>
            {isCross ? (
              <div className="text-right">
                <div className="text-sm text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                  Agent
                </div>
                <div className="font-semibold text-lg">
                  {txn.supplier?.name}
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-sm text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                  Customer
                </div>
                <div className="font-semibold text-lg">
                  {txn.customerName || "Walk-in"}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex-1 text-center md:text-left">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {isCross ? txn.foreignCurrency : "PAID (FROM)"}
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {isCross ? (
                  <span>
                    {Number(txn.foreignAmount).toLocaleString()}{" "}
                    <span className="text-lg text-slate-500">
                      {txn.foreignCurrency}
                    </span>
                  </span>
                ) : (
                  <span>
                    {Number(txn.amountOut).toLocaleString()}{" "}
                    <span className="text-lg text-slate-500">
                      {txn.fromAccount?.currency}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-4">
              {isCross ? (
                <RefreshCw className="h-6 w-6 text-slate-400 mb-2" />
              ) : (
                <ArrowRight className="h-6 w-6 text-slate-400 mb-2" />
              )}
              <Badge
                variant="outline"
                className="text-xs font-mono bg-white"
              >
                {isCross
                  ? `Rate: ${Number(txn.customerRate).toLocaleString()}`
                  : `Rate: ${Number(txn.exchangeRate).toLocaleString()}`}
              </Badge>
            </div>

            <div className="flex-1 text-center md:text-right">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {isCross ? "BRIDGE (MMK)" : "RECEIVED (TO)"}
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {isCross ? (
                  <span>
                    {Number(txn.bridgeAmount).toLocaleString()}{" "}
                    <span className="text-lg text-slate-500">MMK</span>
                  </span>
                ) : (
                  <span>
                    {Number(txn.amountIn).toLocaleString()}{" "}
                    <span className="text-lg text-slate-500">
                      {txn.toAccount?.currency}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-slate-500 border-b pb-2">
                Account Flow
              </h3>
              {isCross ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" /> Bridge Account
                    </div>
                    <div className="font-medium">
                      {txn.bridgeAccount?.name} (MMK)
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" /> Target Account
                    </div>
                    <div className="font-medium">
                      {txn.targetAccount?.name} ({txn.targetAccount?.currency})
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" /> From Account
                    </div>
                    <div className="font-medium">
                      {txn.fromAccount?.name} ({txn.fromAccount?.currency})
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" /> To Account
                    </div>
                    <div className="font-medium">
                      {txn.toAccount?.name} ({txn.toAccount?.currency})
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-slate-500 border-b pb-2">
                Additional Info
              </h3>
              {isCross ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{txn.type}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Supplier Rate
                    </span>
                    <span className="font-mono">
                      {Number(txn.supplierRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Target Amount
                    </span>
                    <span className="font-bold">
                      {Number(txn.targetAmount).toLocaleString()}{" "}
                      {txn.targetAccount?.currency}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Note</span>
                    <span className="font-medium">{txn.note || "-"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isCross && txn.note && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
              <strong>Note:</strong> {txn.note}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
