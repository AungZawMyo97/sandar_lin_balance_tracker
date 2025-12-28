"use client";

import { useFormState } from "react-dom"; // Use standard react-dom hook
import { createDailyClosingAction } from "@/app/users/actions/closingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

// Helper for Submit Button pending state
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm & Save"}
        </Button>
    );
}

const initialState = {
    error: "",
    success: false,
};

interface ClosingDialogProps {
    account: {
        id: number;
        name: string | null;
        currency: string;
        balance: number;
    };
}

export function ClosingDialog({ account }: ClosingDialogProps) {
    const [open, setOpen] = useState(false);
    const [actualBalance, setActualBalance] = useState<string>("");

    // @ts-ignore
    const [state, dispatch] = useFormState(createDailyClosingAction, initialState);

    const diff = actualBalance ? Number(actualBalance) - account.balance : 0;
    const isSurplus = diff > 0;
    const isDeficit = diff < 0;

    // Handle successful close logic in parent or effect, but state updates here
    // If state.success is true, we should probably close dialog. 
    // But useFormState result is reactive.
    if (state?.success && open) {
        setOpen(false);
        // Ideally reset state/form here
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Close Day</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Close Account: {account.name}</DialogTitle>
                    <DialogDescription>
                        Enter the actual balance in your bank/pocket.
                    </DialogDescription>
                </DialogHeader>

                <form action={dispatch} className="space-y-4">
                    <input type="hidden" name="accountId" value={account.id} />

                    {state?.error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                            {state.error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div className="text-muted-foreground">System Balance:</div>
                        <div className="font-mono text-right">{account.balance.toLocaleString()} {account.currency}</div>
                    </div>

                    <div className="space-y-2">
                        <Label>Actual Balance</Label>
                        <Input
                            name="actualBalance"
                            type="number"
                            step="0.01"
                            required
                            value={actualBalance}
                            onChange={(e) => setActualBalance(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    {/* Live Difference Calculation */}
                    {actualBalance && (
                        <div className={`p-3 rounded text-sm flex justify-between items-center ${isSurplus ? "bg-green-50 text-green-700" : isDeficit ? "bg-red-50 text-red-700" : "bg-gray-100"
                            }`}>
                            <span>Difference:</span>
                            <span className="font-bold">
                                {diff > 0 ? "+" : ""}{diff.toLocaleString()} {account.currency}
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Note (Optional)</Label>
                        <Input name="note" placeholder="Reason for difference..." />
                    </div>

                    <SubmitButton />
                </form>
            </DialogContent>
        </Dialog>
    );
}
