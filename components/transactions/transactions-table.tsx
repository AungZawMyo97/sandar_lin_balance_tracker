"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ArrowRight, User, Users } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function TransactionsTable({ data }: { data: any[] }) {
    const router = useRouter();

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
                <RefreshCw className="h-8 w-8 mb-4 opacity-20" />
                <p>No transactions found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border shadow-sm bg-white overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[180px] font-semibold text-slate-600 pl-6">Date</TableHead>
                        <TableHead className="font-semibold text-slate-600">Entity</TableHead>
                        <TableHead className="font-semibold text-slate-600">Type</TableHead>
                        <TableHead className="text-right font-semibold text-slate-600">Foreign Amount</TableHead>
                        <TableHead className="text-right font-semibold text-slate-600">Rate</TableHead>
                        <TableHead className="text-right font-semibold text-slate-600 pr-6">Total MMK</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((txn) => {
                        let isBuy = false;
                        let foreignAmount = "";
                        let foreignCurrency = "";
                        let mmkAmount = "";
                        let rateDisplay = "";
                        let customerDisplay = "";
                        let badge = null;
                        let subText = "";

                        // Styling Variables
                        let rowClass = "cursor-pointer hover:bg-slate-50/80 transition-colors group border-b last:border-0";

                        if (txn.kind === "STANDARD") {
                            isBuy = txn.fromAccount.currency === "MMK";
                            foreignAmount = isBuy ? txn.amountIn : txn.amountOut;
                            foreignCurrency = isBuy ? txn.toAccount.currency : txn.fromAccount.currency;
                            mmkAmount = isBuy ? txn.amountOut : txn.amountIn;
                            rateDisplay = Number(txn.exchangeRate).toLocaleString();
                            customerDisplay = txn.customerName || "Walk-in Customer";
                            subText = txn.customerName ? "Customer" : "Direct";

                            badge = isBuy ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium whitespace-nowrap">
                                    <ArrowDownLeft className="mr-1 h-3 w-3" /> BUY
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium whitespace-nowrap">
                                    <ArrowUpRight className="mr-1 h-3 w-3" /> SELL
                                </Badge>
                            );

                        } else if (txn.kind === "CROSS") {
                            // CROSS Logic
                            mmkAmount = txn.bridgeAmount;
                            customerDisplay = txn.supplier.name;
                            subText = "Agent";

                            foreignAmount = txn.foreignAmount;
                            foreignCurrency = txn.foreignCurrency;

                            // Rate logic for display
                            // Show Customer Rate as it is the "Price" given to the customer.
                            rateDisplay = Number(txn.customerRate).toLocaleString();

                            const isForeignToHeld = txn.type === "FOREIGN_TO_HELD";
                            const sourceCurr = isForeignToHeld ? foreignCurrency : txn.targetAccount.currency;
                            const destCurr = isForeignToHeld ? txn.targetAccount.currency : foreignCurrency;

                            badge = (
                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-medium whitespace-nowrap">
                                    <RefreshCw className="mr-1 h-3 w-3" /> CROSS
                                </Badge>
                            );
                        }

                        return (
                            <TableRow
                                key={txn.id + (txn.kind || "S")}
                                className={rowClass}
                                onClick={() => router.push(`/transactions/${txn.kind.toLowerCase()}/${txn.id}`)}
                            >
                                <TableCell className="pl-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-700">
                                            {format(new Date(txn.createdAt), "MMM d, yyyy")}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(txn.createdAt), "h:mm a")}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${txn.kind === "CROSS" ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500"}`}>
                                            {txn.kind === "CROSS" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{customerDisplay}</span>
                                            <span className="text-xs text-slate-400 capitalize">{subText}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col items-start gap-1">
                                        {badge}
                                        {/* Optional: Show From -> To currency hints for Cross */}
                                        {txn.kind === "CROSS" && (
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                {txn.type === "FOREIGN_TO_HELD" ? `${txn.foreignCurrency} → ${txn.targetAccount.currency}` : `${txn.targetAccount.currency} → ${txn.foreignCurrency}`}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="font-bold text-slate-700 font-mono tracking-tight">
                                        {Number(foreignAmount).toLocaleString()} <span className="text-xs text-slate-400 font-sans ml-0.5">{foreignCurrency}</span>
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground border-slate-200">
                                        {rateDisplay}
                                    </Badge>
                                </TableCell>

                                <TableCell className="text-right pr-6">
                                    <div className="font-bold text-slate-900 font-mono tracking-tight text-base">
                                        {Number(mmkAmount).toLocaleString()} <span className="text-xs text-slate-400 font-sans ml-0.5">MMK</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                        {txn.kind === "CROSS" ? "Bridge Amount" : (isBuy ? "Total Paid" : "Total Received")}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
