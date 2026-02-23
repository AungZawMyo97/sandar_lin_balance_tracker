import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Wallet,
  TrendingUp,
  Plus,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { AccountService } from "@/app/services/accountService";
import { TransactionRepository } from "@/app/repositories/transactionRepository";
import { ExchangeRateService } from "@/app/services/exchangeRateService";
import { Currency } from "@/app/lib/enums";

export default async function DashboardPage() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  const uId = parseInt(userId);

  const accounts = await AccountService.getUserAccounts(uId);
  const mmkBalance = accounts.filter(a => a.currency === "MMK").reduce((sum, a) => sum + Number(a.balance), 0);
  const thbBalance = accounts.filter(a => a.currency === "THB").reduce((sum, a) => sum + Number(a.balance), 0);
  const usdBalance = accounts.filter(a => a.currency === "USD").reduce((sum, a) => sum + Number(a.balance), 0);
  const sgdBalance = accounts.filter(a => a.currency === "SGD").reduce((sum, a) => sum + Number(a.balance), 0);

  // Get exchange rates from database
  const rates = await ExchangeRateService.getRatesMap();
  const RATE_THB = rates.THB || 110;
  const RATE_USD = rates.USD || 4500;
  const RATE_SGD = rates.SGD || 3300;
  const estimatedWealth = mmkBalance + (thbBalance * RATE_THB) + (usdBalance * RATE_USD) + (sgdBalance * RATE_SGD);

  const { data: recentTransactions } = await TransactionRepository.getHistory(uId, { page: 1, limit: 5 });

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your exchange store today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/transactions/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Transaction
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Kyat
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              K {mmkBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Cash in Hand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Baht
            </CardTitle>
            <span className="text-xl font-bold text-muted-foreground">฿</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿ {thbBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ~ K {(thbBalance * RATE_THB).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Est. Net Wealth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              K {estimatedWealth.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Assets Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Lent</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K 0</div>
            <p className="text-xs text-muted-foreground">Coming Soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 5 transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTransactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No transactions yet.
                </div>
              ) : (
                recentTransactions.map((txn: any) => {
                  let isBuy = false;
                  let displayAmount = "";
                  let displayType = "";
                  let icon = null;

                  if (txn.kind === "STANDARD") {
                    isBuy = txn.fromAccount.currency === "MMK";
                    const fAmount = isBuy ? txn.amountIn : txn.amountOut;
                    const fCurr = isBuy ? txn.toAccount.currency : txn.fromAccount.currency;

                    displayAmount = `${Number(fAmount).toLocaleString()} ${fCurr}`;
                    displayType = isBuy ? "BUY" : "SELL";
                    icon = isBuy ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> : <ArrowUpRight className="h-4 w-4 text-blue-600" />;
                  } else {
                    displayType = "CROSS";
                    displayAmount = `${Number(txn.foreignAmount).toLocaleString()} ${txn.foreignCurrency}`;
                    icon = <RefreshCw className="h-4 w-4 text-purple-600" />;
                  }

                  return (
                    <div key={txn.id + txn.kind} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${txn.kind === 'CROSS' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                          {icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{txn.customerName || txn.supplier?.name || "Ref: " + txn.id}</p>
                          <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleTimeString()} • {displayType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">{displayAmount}</p>
                        {txn.kind === "STANDARD" && (
                          <p className="text-xs text-muted-foreground">@ {Number(txn.exchangeRate).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common daily tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Link href="/transactions/create">
              <div className="flex items-center p-3 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4 group-hover:bg-emerald-200 transition-colors">
                  <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">New Transaction</h4>
                  <p className="text-xs text-muted-foreground">Record a buy/sell</p>
                </div>
              </div>
            </Link>

            <Link href="/suppliers/create">
              <div className="flex items-center p-3 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Add New Agent</h4>
                  <p className="text-xs text-muted-foreground">Register supplier</p>
                </div>
              </div>
            </Link>

            <Link href="/transactions">
              <div className="flex items-center p-3 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">View History</h4>
                  <p className="text-xs text-muted-foreground">Check recent logs</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
