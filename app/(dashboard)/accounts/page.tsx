import { getCurrentUser } from "@/lib/session";
import { AccountService } from "@/app/services/accountService";
import { redirect } from "next/navigation";

import { format } from "date-fns"; // npm install date-fns
import { CreateAccountDialog } from "@/components/accounts/create-account-dialogue";
import { ClosingDialog } from "@/components/closings/closing-dialog";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function AccountsPage() {
  const userId = await getCurrentUser();

  if (!userId) {
    redirect("/login");
  }

  // Fetch Real Data
  const accounts = await AccountService.getUserAccounts(parseInt(userId));

  return (
    <div className="flex-1 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Accounts</h2>
          <p className="text-muted-foreground">
            Manage your cash drawers and bank accounts.
          </p>
        </div>
        <CreateAccountDialog />
      </div>

      {/* ACCOUNT LIST CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Active Accounts</CardTitle>
          <CardDescription>
            Overview of your current balances and daily closing status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
                <TableHead className="text-center">Last Closing</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No accounts found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => {
                  const lastClosing = account.dailyClosings[0];
                  // Check if closed today (Simple check)
                  const isClosedToday =
                    lastClosing &&
                    new Date(lastClosing.closingDate).toDateString() ===
                    new Date().toDateString();

                  return (
                    <TableRow key={account.id}>
                      {/* Name & Icon */}
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                          {account.name || "Unnamed Account"}
                        </div>
                      </TableCell>

                      {/* Currency */}
                      <TableCell className="font-bold text-gray-500">
                        {account.currency}
                      </TableCell>

                      {/* Balance */}
                      <TableCell className="text-right text-lg font-bold font-mono">
                        {Number(account.balance).toLocaleString()}
                      </TableCell>

                      {/* Closing Status */}
                      <TableCell className="text-center">
                        {isClosedToday ? (
                          <div className="flex items-center justify-center text-green-600 text-sm">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            <span>Closed Today</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-amber-600 text-sm">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            <span>Pending</span>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {lastClosing
                            ? format(
                              new Date(lastClosing.closingDate),
                              "MMM d, HH:mm"
                            )
                            : "Never closed"}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <ClosingDialog account={{ id: account.id, name: account.name, currency: account.currency, balance: Number(account.balance) }} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
