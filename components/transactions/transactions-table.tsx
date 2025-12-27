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
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export function TransactionsTable({ data }: { data: any[] }) {
    if (data.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No transactions found.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer / Agent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Foreign Amount</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Total MMK (Bridge)</TableHead>
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

                    if (txn.kind === "STANDARD") {
                        isBuy = txn.fromAccount.currency === "MMK";
                        foreignAmount = isBuy ? txn.amountIn : txn.amountOut;
                        foreignCurrency = isBuy ? txn.toAccount.currency : txn.fromAccount.currency;
                        mmkAmount = isBuy ? txn.amountOut : txn.amountIn;
                        rateDisplay = Number(txn.exchangeRate).toLocaleString();
                        customerDisplay = txn.customerName || "Walk-in";

                        badge = isBuy ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <ArrowDownLeft className="mr-1 h-3 w-3" /> BUY {foreignCurrency}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <ArrowUpRight className="mr-1 h-3 w-3" /> SELL {foreignCurrency}
                            </Badge>
                        );

                    } else if (txn.kind === "CROSS") {
                        // CROSS Logic
                        // bridgeAmount is always MMK
                        mmkAmount = txn.bridgeAmount;
                        customerDisplay = `Ag: ${txn.supplier.name}`;
                        // Show Foreign Currency amount
                        foreignAmount = txn.foreignAmount;
                        foreignCurrency = txn.foreignCurrency;


                        // Logic for badge text direction
                        const isForeignToHeld = txn.type === "FOREIGN_TO_HELD";
                        const sourceCurr = isForeignToHeld ? foreignCurrency : txn.targetAccount.currency;
                        const destCurr = isForeignToHeld ? txn.targetAccount.currency : foreignCurrency;

                        // Rate: Show Supplier / Customer rates
                        rateDisplay = `${Number(txn.supplierRate).toLocaleString()} / ${Number(txn.customerRate).toLocaleString()}`;

                        badge = (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <RefreshCw className="mr-1 h-3 w-3" /> {sourceCurr} to {destCurr}
                            </Badge>
                        );
                    }

                    return (
                        <TableRow key={txn.id + (txn.kind || "S")}>
                            <TableCell className="whitespace-nowrap">
                                <span suppressHydrationWarning>
                                    {format(new Date(txn.createdAt), "MMM d, HH:mm")}
                                </span>
                            </TableCell>
                            <TableCell className="font-medium">
                                {customerDisplay}
                            </TableCell>
                            <TableCell>
                                {badge}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {Number(foreignAmount).toLocaleString()} {foreignCurrency}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                {rateDisplay}
                            </TableCell>
                            <TableCell className="text-right font-bold font-mono">
                                {Number(mmkAmount).toLocaleString()} MMK
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
