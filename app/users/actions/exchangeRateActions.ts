"use server";

import { getCurrentUser } from "@/lib/session";
import { ExchangeRateService } from "@/app/services/exchangeRateService";
import { Currency } from "@/app/lib/enums";
import { revalidatePath } from "next/cache";

export async function updateExchangeRatesFormAction(
    prevState: { success: boolean; error: string | null },
    formData: FormData
) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const ratesToUpdate: Array<{ currency: Currency; rate: number; rateFromMMK: number }> = [];
        
        // Only THB, AED, JPY exchange rates are tracked
        const allCurrencies: Currency[] = [
            Currency.THB,
            Currency.AED,
            Currency.JPY,
        ];

        allCurrencies.forEach((currency) => {
            const toMMK = formData.get(`${currency}_to_mmk`);
            const fromMMK = formData.get(`${currency}_from_mmk`);
            
            if (toMMK || fromMMK) {
                const rateToMMK = toMMK ? parseFloat(toMMK as string) : 0;
                const rateFromMMK = fromMMK ? parseFloat(fromMMK as string) : 0;
                
                if ((rateToMMK > 0) || (rateFromMMK > 0)) {
                    ratesToUpdate.push({ 
                        currency, 
                        rate: rateToMMK, 
                        rateFromMMK: rateFromMMK 
                    });
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
    } catch (error: unknown) {
        console.error("Exchange Rate Update Error:", error);
        const message = error instanceof Error ? error.message : "Failed to update exchange rates";
        return { success: false, error: message };
    }
}
