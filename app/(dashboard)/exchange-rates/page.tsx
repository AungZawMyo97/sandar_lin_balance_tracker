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

    const ratesToMMK = await ExchangeRateService.getRatesMap();
    const ratesFromMMK = await ExchangeRateService.getRatesFromMMKMap();

    // Only THB, AED, JPY exchange rates are tracked
    const allCurrencies: Currency[] = [Currency.THB, Currency.AED, Currency.JPY];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Exchange Rates</h2>
                <p className="text-muted-foreground">
                    Manage exchange rates for currency conversion. Each currency has rates in both directions.
                </p>
            </div>

            <ExchangeRatesForm 
                ratesToMMK={ratesToMMK}
                ratesFromMMK={ratesFromMMK}
                currencies={allCurrencies}
            />
        </div>
    );
}
