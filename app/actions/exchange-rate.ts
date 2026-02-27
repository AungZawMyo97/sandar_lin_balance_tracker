"use server";

import { getCurrentUser } from "@/lib/session";
import { ExchangeRateService } from "@/app/services/exchangeRateService";
import { Currency } from "@/lib/enums";
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
    const ratesToUpdate: Array<{
      currency: Currency;
      rate: number;
      rateFromMMK: number;
    }> = [];

    const allCurrencies: Currency[] = [
      Currency.THB,
      Currency.AED,
      Currency.JPY,
    ];

    allCurrencies.forEach((currency) => {
      const buyMMK = formData.get(`${currency}_buy_mmk`);
      const sellMMK = formData.get(`${currency}_sell_mmk`);

      if (buyMMK || sellMMK) {
        const buyRate = buyMMK ? parseFloat(buyMMK as string) : 0;
        const sellRate = sellMMK ? parseFloat(sellMMK as string) : 0;

        if (buyRate > 0 || sellRate > 0) {
          ratesToUpdate.push({
            currency,
            rate: buyRate,
            rateFromMMK: sellRate,
          });
        }
      }
    });

    if (ratesToUpdate.length === 0) {
      return {
        success: false,
        error: "Please enter at least one exchange rate",
      };
    }

    await ExchangeRateService.updateRates(ratesToUpdate);
    revalidatePath("/exchange-rates");
    revalidatePath("/");
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("Exchange Rate Update Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update exchange rates";
    return { success: false, error: message };
  }
}
