import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ExchangeRateService } from "@/app/services/exchangeRateService";
import { Currency } from "@/app/lib/enums";
import { ExchangeRatesForm } from "@/components/exchange-rates/exchange-rates-form";

export default async function ExchangeRatesPage() {
    const userId = await getCurrentUser();
    if (!userId) {
        redirect("/login");
    }

    const buyRates = await ExchangeRateService.getRatesMap();
    const sellRates = await ExchangeRateService.getSellRatesMap();

    // Only THB, AED, JPY exchange rates are tracked
    const allCurrencies: Currency[] = [Currency.THB, Currency.AED, Currency.JPY];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Exchange Rates</h2>
                <p className="text-muted-foreground">
                    Manage buy and sell rates for currency conversion. All rates are in MMK per 1 unit of foreign currency.
                </p>
            </div>

            <ExchangeRatesForm 
                buyRates={buyRates}
                sellRates={sellRates}
                currencies={allCurrencies}
            />
        </div>
    );
}
