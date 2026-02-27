"use client";

import { useState, useMemo, useCallback } from "react";
import { createTransactionAction } from "@/app/actions/transaction";
import { Currency } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Loader2, ArrowLeftRight, User } from "lucide-react";

// Local types
type Account = {
    id: number;
    name: string | null;
    currency: string;
    balance: number; // Serialized to number now
};

type Supplier = {
    id: number;
    name: string;
};

interface TransactionFormProps {
    accounts: Account[];
    suppliers: Supplier[];
}

export function TransactionForm({ accounts, suppliers }: TransactionFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"BUY" | "SELL" | "CROSS">("BUY");

    // Standard Mode States
    const [foreignCurrency, setForeignCurrency] = useState<Currency>(Currency.THB);
    const [selectedSourceId, setSelectedSourceId] = useState<string>("");
    const [selectedDestId, setSelectedDestId] = useState<string>("");
    const [rate, setRate] = useState<string>("");
    const [foreignAmount, setForeignAmount] = useState<string>("");
    const [rateBasisOverride, setRateBasisOverride] = useState<"UNIT" | "100K" | null>(null);

    // Cross Mode States
    const [crossType, setCrossType] = useState<"FOREIGN_TO_HELD" | "HELD_TO_FOREIGN">("FOREIGN_TO_HELD");
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
    const [selectedBridgeId, setSelectedBridgeId] = useState<string>(""); // MMK Account
    const [selectedTargetId, setSelectedTargetId] = useState<string>(""); // Held Currency (e.g. THB)
    const [crossForeignCurrency, setCrossForeignCurrency] = useState<string>("JPY");
    const [crossForeignAmount, setCrossForeignAmount] = useState<string>("");
    const [supplierRate, setSupplierRate] = useState<string>(""); // Cost
    const [customerRate, setCustomerRate] = useState<string>(""); // Price
    const [targetAmount, setTargetAmount] = useState<string>("");

    // Derive rateBasis from currency, allow manual override
    const rateBasis = useMemo(() => {
        if (rateBasisOverride !== null) return rateBasisOverride;
        const currency = mode === "CROSS" ? crossForeignCurrency : foreignCurrency;
        return currency === "THB" ? "100K" : "UNIT";
    }, [rateBasisOverride, foreignCurrency, crossForeignCurrency, mode]);

    const setRateBasis = useCallback((value: "UNIT" | "100K") => {
        setRateBasisOverride(value);
    }, []);

    const sourceAccounts = useMemo(() => {
        if (mode === "BUY") return accounts.filter(a => a.currency === "MMK");
        return accounts.filter(a => a.currency === foreignCurrency);
    }, [accounts, mode, foreignCurrency]);

    const destAccounts = useMemo(() => {
        if (mode === "BUY") return accounts.filter(a => a.currency === foreignCurrency);
        return accounts.filter(a => a.currency === "MMK");
    }, [accounts, mode, foreignCurrency]);

    const bridgeAccounts = useMemo(() => accounts.filter(a => a.currency === "MMK"), [accounts]);
    const targetAccounts = useMemo(() => accounts, [accounts]); // Allow all accounts, including MMK

    const calculateStandardTotal = () => {
        const r = parseFloat(rate);
        const amt = parseFloat(foreignAmount);
        if (!isNaN(r) && !isNaN(amt)) {
            if (rateBasis === "100K") {
                // Rate is 100,000 MMK = X Foreign? or Rate is Foreign Amount for 100k MMK?
                // User said: "768 THB = 100000 MMK" -> The Rate INPUT is 768.
                // Meaning: 100,000 MMK costs 768 THB.
                // We want Total MMK.
                // Formula: (Amount / Rate) * 100,000
                // Example: Amount 1000 THB. Rate 768.
                // (1000 / 768) * 100,000 = 130,208.
                return ((amt * 100000) / r).toFixed(0);
            }
            return (r * amt).toFixed(0);
        }
        return "0";
    };

    const calculateCrossMMK = () => {
        const sRate = parseFloat(supplierRate);
        const amt = parseFloat(crossForeignAmount);
        if (!isNaN(sRate) && !isNaN(amt)) {
            if (rateBasis === "100K") {
                return ((amt * 100000) / sRate).toFixed(2);
            }
            return (sRate * amt).toFixed(2);
        }
        return "0";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);

        if (mode === "CROSS") {
            formData.set("transactionMode", "CROSS");
            formData.set("supplierId", selectedSupplierId);
            formData.set("foreignCurrency", crossForeignCurrency);
            formData.set("foreignAmount", crossForeignAmount);
            formData.set("bridgeAccountId", selectedBridgeId);
            formData.set("bridgeAmount", calculateCrossMMK());
            formData.set("supplierRate", supplierRate);
            formData.set("targetAccountId", selectedTargetId);
            formData.set("targetAmount", targetAmount);
            formData.set("customerRate", customerRate);
            formData.set("crossType", crossType);
        } else {
            formData.set("transactionMode", "STANDARD");
            formData.set("exchangeRate", rate);
            const mmkAmount = parseFloat(calculateStandardTotal());
            const fAmount = parseFloat(foreignAmount);
            if (mode === "BUY") {
                formData.set("fromAccountId", selectedSourceId);
                formData.set("toAccountId", selectedDestId);
                formData.set("amountOut", mmkAmount.toString());
                formData.set("amountIn", fAmount.toString());
            } else {
                formData.set("fromAccountId", selectedSourceId);
                formData.set("toAccountId", selectedDestId);
                formData.set("amountOut", fAmount.toString());
                formData.set("amountIn", mmkAmount.toString());
            }
        }

        const result = await createTransactionAction(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-3xl mx-auto shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-xl">Record Transaction</CardTitle>
                <CardDescription>Select the type of exchange operation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "BUY" | "SELL" | "CROSS")} className="w-full mb-8">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                        <TabsTrigger value="BUY" className="h-10 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:font-bold border-b-2 data-[state=active]:border-green-600 rounded-none transition-all">
                            Buy Foreign
                        </TabsTrigger>
                        <TabsTrigger value="SELL" className="h-10 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:font-bold border-b-2 data-[state=active]:border-blue-600 rounded-none transition-all">
                            Sell Foreign
                        </TabsTrigger>
                        <TabsTrigger value="CROSS" className="h-10 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:font-bold border-b-2 data-[state=active]:border-purple-600 rounded-none transition-all">
                            Cross (Agent)
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center">
                            <span className="font-semibold mr-2">Error:</span> {error}
                        </div>
                    )}

                    {mode === "CROSS" ? (
                        <div className="space-y-6">
                            {/* CROSS TYPE SELECTOR */}
                            <div className="bg-slate-50 p-1 rounded-lg inline-block w-full">
                                <Tabs value={crossType} onValueChange={(v) => setCrossType(v as "FOREIGN_TO_HELD" | "HELD_TO_FOREIGN")} className="w-full">
                                    <TabsList className="w-full grid grid-cols-2">
                                        <TabsTrigger value="FOREIGN_TO_HELD">Customer Gives {crossForeignCurrency}</TabsTrigger>
                                        <TabsTrigger value="HELD_TO_FOREIGN">Customer Wants {crossForeignCurrency}</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* LEFT: AGENT SIDE */}
                                <div className="space-y-4 border p-4 rounded-xl bg-slate-50/50">
                                    <h3 className="font-semibold text-sm text-slate-500 uppercase flex items-center gap-2">
                                        <User className="h-4 w-4" /> Agent Side
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between mb-1.5">
                                                <Label className="text-xs font-medium uppercase text-muted-foreground">Agent Name</Label>
                                                <a href="/suppliers/create" className="text-xs text-blue-600 hover:underline font-medium">+ New</a>
                                            </div>
                                            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId} required>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Agent" /></SelectTrigger>
                                                <SelectContent>
                                                    {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <Label className="text-xs font-medium uppercase text-muted-foreground block">Agent Rate (Cost)</Label>
                                                <div className="flex bg-slate-200 rounded-md p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRateBasis("UNIT")}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium transition-all ${rateBasis === "UNIT" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                                                    >
                                                        1 Unit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRateBasis("100K")}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium transition-all ${rateBasis === "100K" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                                                    >
                                                        100k
                                                    </button>
                                                </div>
                                            </div>
                                            <Input
                                                type="number" step="0.0001"
                                                value={supplierRate} onChange={e => setSupplierRate(e.target.value)}
                                                onWheel={(e) => e.currentTarget.blur()}
                                                placeholder="Amount" className="bg-white font-mono" required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-medium uppercase text-muted-foreground mb-1.5 block">Bridge Account (MMK)</Label>
                                            <Select value={selectedBridgeId} onValueChange={setSelectedBridgeId} required>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select MMK Account" /></SelectTrigger>
                                                <SelectContent>
                                                    {bridgeAccounts.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name} ({a.balance.toLocaleString()})</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-right mt-1 text-muted-foreground font-mono">
                                                Est: {Number(calculateCrossMMK()).toLocaleString()} MMK
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: CUSTOMER SIDE */}
                                <div className="space-y-4 border p-4 rounded-xl">
                                    <h3 className="font-semibold text-sm text-slate-500 uppercase flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4" /> Exchange Details
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-1">
                                                <Label className="text-xs font-medium uppercase text-muted-foreground mb-1.5 block">Currency</Label>
                                                <Select value={crossForeignCurrency} onValueChange={setCrossForeignCurrency}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(Currency).filter(c => !["MMK"].includes(c)).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-xs font-medium uppercase text-muted-foreground mb-1.5 block">Amount</Label>
                                                <Input type="number" value={crossForeignAmount} onChange={e => setCrossForeignAmount(e.target.value)} onWheel={(e) => e.currentTarget.blur()} placeholder="0.00" required className="font-bold text-lg" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-medium uppercase text-muted-foreground mb-1.5 block">Customer Rate (Price)</Label>
                                            <Input type="number" step="0.0001" value={customerRate} onChange={e => setCustomerRate(e.target.value)} onWheel={(e) => e.currentTarget.blur()} placeholder="0.00" required className="font-mono" />
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t mt-4">
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-medium uppercase text-muted-foreground mb-1.5 block">Target Account ({targetAccounts.find(a => a.id.toString() === selectedTargetId)?.currency || "Held"})</Label>
                                                <Select value={selectedTargetId} onValueChange={setSelectedTargetId} required>
                                                    <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                                                    <SelectContent>
                                                        {targetAccounts.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name} - {a.currency} ({a.balance.toLocaleString()})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium uppercase text-muted-foreground mb-1.5 block">Final Amount</Label>
                                                <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} onWheel={(e) => e.currentTarget.blur()} placeholder="Amount to Pay/Receive" required className="bg-slate-100 font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* STANDARD MODE UI */
                        <div className="space-y-8">
                            {/* SECTION 1: EXCHANGE CONFIG */}
                            <div className="grid grid-cols-12 gap-6 bg-slate-50/50 p-6 rounded-xl border">
                                <div className="col-span-5">
                                    <Label className="mb-2 block font-semibold text-sm">Currency</Label>
                                    <Select value={foreignCurrency} onValueChange={(v) => setForeignCurrency(v as Currency)}>
                                        <SelectTrigger className="h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Currency).filter(c => c !== "MMK").map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-2 flex items-center justify-center pt-6 text-muted-foreground">
                                    <ArrowRight className="h-5 w-5" />
                                </div>

                                <div className="col-span-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="font-semibold text-sm">Rate</Label>
                                        <div className="flex bg-slate-200 rounded-md p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setRateBasis("UNIT")}
                                                className={`text-[10px] px-2 py-0.5 rounded-sm font-medium transition-all ${rateBasis === "UNIT" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                1 Unit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRateBasis("100K")}
                                                className={`text-[10px] px-2 py-0.5 rounded-sm font-medium transition-all ${rateBasis === "100K" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                100k MMK
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="number" step="0.01"
                                            value={rate} onChange={(e) => setRate(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            className="h-11 pl-8 bg-white font-mono text-base"
                                            placeholder="0.00"
                                            required
                                        />
                                        <span className="absolute left-3 top-3 text-muted-foreground text-sm">@</span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Accounts Flow */}
                            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-start">
                                {/* FROM */}
                                <div className="space-y-2 p-4 border rounded-xl hover:border-slate-300 transition-colors">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold">From Account</Label>
                                    <Select name="fromAccountId" value={selectedSourceId} onValueChange={setSelectedSourceId} required>
                                        <SelectTrigger className="border-0 shadow-none p-0 h-auto text-lg font-medium focus:ring-0">
                                            <SelectValue placeholder="Select Source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sourceAccounts.map(a => (
                                                <SelectItem key={a.id} value={a.id.toString()}>
                                                    <span className="flex items-center justify-between w-full min-w-[200px]">
                                                        <span>{a.name}</span>
                                                        <span className="text-muted-foreground text-xs ml-2">{a.balance.toLocaleString()} {a.currency}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-center pt-8">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* TO */}
                                <div className="space-y-2 p-4 border rounded-xl hover:border-slate-300 transition-colors">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold">To Account</Label>
                                    <Select name="toAccountId" value={selectedDestId} onValueChange={setSelectedDestId} required>
                                        <SelectTrigger className="border-0 shadow-none p-0 h-auto text-lg font-medium focus:ring-0">
                                            <SelectValue placeholder="Select Dest" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {destAccounts.map(a => (
                                                <SelectItem key={a.id} value={a.id.toString()}>
                                                    <span className="flex items-center justify-between w-full min-w-[200px]">
                                                        <span>{a.name}</span>
                                                        <span className="text-muted-foreground text-xs ml-2">{a.balance.toLocaleString()} {a.currency}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* SECTION 3: Amounts */}
                            <div className="bg-slate-900 text-white p-6 rounded-2xl grid grid-cols-2 gap-8">
                                <div>
                                    <Label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Amount ({foreignCurrency})</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={foreignAmount}
                                        onChange={(e) => setForeignAmount(e.target.value)}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        className="bg-transparent border-0 border-b border-slate-700 rounded-none px-0 text-3xl font-bold placeholder:text-slate-800 focus-visible:ring-0 focus-visible:border-white h-auto py-2 text-white"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="text-right">
                                    <Label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Total (MMK)</Label>
                                    <div className="text-3xl font-bold font-mono tracking-tight text-green-400 py-2 border-b border-transparent">
                                        {Number(calculateStandardTotal()).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="col-span-1">
                            <Label className="text-xs mb-1.5 block">Customer Name (Optional)</Label>
                            <Input name="customerName" placeholder="John Doe" className="h-9" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-xs mb-1.5 block">Note (Optional)</Label>
                            <Input name="note" placeholder="Memo" className="h-9" />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-md" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Confirm Transaction"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
