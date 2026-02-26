"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateExchangeRatesFormAction } from "@/app/users/actions/exchangeRateActions";
import { Currency } from "@/app/lib/enums";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                </>
            ) : (
                "Update Exchange Rates"
            )}
        </Button>
    );
}

interface ExchangeRatesFormProps {
    buyRates: Record<Currency, number>;
    sellRates: Record<Currency, number>;
    currencies: Currency[];
}

const initialState = {
    success: false,
    error: null as string | null,
};

export function ExchangeRatesForm({ buyRates, sellRates, currencies }: ExchangeRatesFormProps) {
    const [state, formAction] = useActionState(updateExchangeRatesFormAction, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Exchange Rates</CardTitle>
                <CardDescription>
                    Update exchange rates. Each currency has Buy and Sell rates in MMK.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    {currencies.map((currency) => (
                        <div key={currency} className="rounded-lg border p-4 space-y-3">
                            <h3 className="font-semibold text-lg">1 {currency}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`${currency}_buy_mmk`}>
                                        Buy (MMK)
                                    </Label>
                                    <Input
                                        id={`${currency}_buy_mmk`}
                                        name={`${currency}_buy_mmk`}
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        defaultValue={buyRates[currency] || ""}
                                        placeholder="0.0000"
                                        required
                                    />
                                    {buyRates[currency] > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            1 {currency} = {buyRates[currency].toLocaleString()} MMK (buy)
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${currency}_sell_mmk`}>
                                        Sell (MMK)
                                    </Label>
                                    <Input
                                        id={`${currency}_sell_mmk`}
                                        name={`${currency}_sell_mmk`}
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        defaultValue={sellRates[currency] || ""}
                                        placeholder="0.0000"
                                        required
                                    />
                                    {sellRates[currency] > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            1 {currency} = {sellRates[currency].toLocaleString()} MMK (sell)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {state.error && (
                        <div className="p-3 rounded text-sm bg-red-50 text-red-700 border border-red-200">
                            {state.error}
                        </div>
                    )}

                    {state.success && (
                        <div className="p-3 rounded text-sm bg-green-50 text-green-700 border border-green-200">
                            Exchange rates updated successfully!
                        </div>
                    )}

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
