import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { AccountRepository } from "@/app/repositories/accountRepository";
import { DailyClosingRepository } from "@/app/repositories/dailyClosingRepository";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClosingDialog } from "@/components/closings/closing-dialog";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ClosingsPage() {
    const userId = await getCurrentUser();
    if (!userId) redirect("/users/login");
    const uId = parseInt(userId);

    // 1. Fetch Accounts for Actions
    const accounts = await AccountRepository.findByUserId(uId);

    // 2. Fetch Recent Closings History
    const history = await DailyClosingRepository.getHistory(uId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Daily Status</h2>

            {/* ACTION SECTION */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                    <Card key={account.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                            <div className="text-xs text-muted-foreground">{account.currency}</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-4">
                                {Number(account.balance).toLocaleString()}
                                <span className="text-sm font-normal text-muted-foreground ml-1">{account.currency}</span>
                            </div>
                            <ClosingDialog account={{ id: account.id, name: account.name, currency: account.currency, balance: Number(account.balance) }} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* HISTORY TABLE */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Closings</CardTitle>
                    <CardDescription>History of your snapshots</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>System</TableHead>
                                <TableHead>Actual</TableHead>
                                <TableHead>Diff</TableHead>
                                <TableHead>Profit (MMK)</TableHead>
                                <TableHead>Note</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((record) => {
                                const diff = Number(record.difference);
                                const profit = record.profitPerDayMMK ? Number(record.profitPerDayMMK) : null;
                                return (
                                    <TableRow key={record.id}>
                                        <TableCell>{format(record.closingDate, "MMM d, HH:mm")}</TableCell>
                                        <TableCell>{record.account.name} ({record.account.currency})</TableCell>
                                        <TableCell>{Number(record.systemBalance).toLocaleString()}</TableCell>
                                        <TableCell>{Number(record.actualCashBalance).toLocaleString()}</TableCell>
                                        <TableCell className={diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-500"}>
                                            {diff > 0 ? "+" : ""}{diff.toLocaleString()}
                                        </TableCell>
                                        <TableCell className={profit !== null ? (profit > 0 ? "text-green-600 font-semibold" : profit < 0 ? "text-red-600" : "text-gray-500") : "text-muted-foreground"}>
                                            {profit !== null ? `${profit > 0 ? "+" : ""}${profit.toLocaleString()}` : "-"}
                                        </TableCell>
                                        <TableCell>{record.note || "-"}</TableCell>
                                    </TableRow>
                                )
                            })}
                            {history.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No closing records yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
