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

    const rates = await ExchangeRateService.getAllRates();
    const ratesMap = await ExchangeRateService.getRatesMap();

    // Get all currencies except MMK
    const allCurrencies = Object.values(Currency).filter(c => c !== "MMK");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Exchange Rates</h2>
                <p className="text-muted-foreground">
                    Manage exchange rates for currency conversion. Rates can be updated frequently.
                </p>
            </div>

            <ExchangeRatesForm 
                initialRates={ratesMap}
                currencies={allCurrencies}
            />
        </div>
    );
}
