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
    initialRates: Record<Currency, number>;
    currencies: Currency[];
}

const initialState = {
    success: false,
    error: null as string | null,
};

export function ExchangeRatesForm({ initialRates, currencies }: ExchangeRatesFormProps) {
    const [state, formAction] = useActionState(updateExchangeRatesFormAction, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Exchange Rates</CardTitle>
                <CardDescription>
                    Update exchange rates to MMK. MMK rate is always 1.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currencies.map((currency) => (
                            <div key={currency} className="space-y-2">
                                <Label htmlFor={currency}>
                                    {currency} to MMK
                                </Label>
                                <Input
                                    id={currency}
                                    name={currency}
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    defaultValue={initialRates[currency] || ""}
                                    placeholder="0.0000"
                                    required
                                />
                                {initialRates[currency] && (
                                    <p className="text-xs text-muted-foreground">
                                        1 {currency} = {initialRates[currency].toLocaleString()} MMK
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

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
