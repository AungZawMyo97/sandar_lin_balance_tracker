"use server";

import { getCurrentUser } from "@/lib/session";
import { ExchangeRateService } from "@/app/services/exchangeRateService";
import { Currency } from "@/app/lib/enums";
import { revalidatePath } from "next/cache";

export async function updateExchangeRatesFormAction(
    prevState: any,
    formData: FormData
) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const ratesToUpdate: Array<{ currency: Currency; rate: number }> = [];
        
        // Get all currencies except MMK
        const allCurrencies: Currency[] = [
            Currency.THB,
            Currency.USD,
            Currency.SGD,
            Currency.EUR,
            Currency.JPY,
            Currency.CNY,
            Currency.AED,
            Currency.MYR,
        ];

        allCurrencies.forEach((currency) => {
            const value = formData.get(currency);
            if (value) {
                const rate = parseFloat(value as string);
                if (!isNaN(rate) && rate > 0) {
                    ratesToUpdate.push({ currency, rate });
                }
            }
        });

        if (ratesToUpdate.length === 0) {
            return { success: false, error: "Please enter at least one exchange rate" };
        }

        await ExchangeRateService.updateRates(ratesToUpdate);
        revalidatePath("/exchange-rates");
        revalidatePath("/");
        return { success: true, error: null };
    } catch (error: any) {
        console.error("Exchange Rate Update Error:", error);
        return { success: false, error: error.message || "Failed to update exchange rates" };
    }
}
