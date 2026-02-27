import { ExchangeRateRepository } from "@/app/repositories/exchangeRateRepository";
import { Currency } from "@/lib/enums";

export const ExchangeRateService = {
  async getRatesMap(): Promise<Record<Currency, number>> {
    return await ExchangeRateRepository.getRatesMap();
  },

  async getSellRatesMap(): Promise<Record<Currency, number>> {
    return await ExchangeRateRepository.getSellRatesMap();
  },

  async getRate(currency: Currency): Promise<number> {
    if (currency === "MMK") return 1;

    const rate = await ExchangeRateRepository.getByCurrency(currency);
    return rate ? Number(rate.rate) : 1;
  },

  async updateRate(currency: Currency, rate: number, rateFromMMK?: number) {
    if (currency === "MMK") {
      throw new Error("Cannot update MMK rate (always 1)");
    }
    return await ExchangeRateRepository.upsert(currency, rate, rateFromMMK);
  },

  async updateRates(
    rates: Array<{ currency: Currency; rate: number; rateFromMMK: number }>
  ) {
    const filtered = rates.filter((r) => r.currency !== "MMK");
    return await ExchangeRateRepository.upsertMany(filtered);
  },

  async getAllRates() {
    return await ExchangeRateRepository.getAll();
  },

  async convertToMMK(amount: number, currency: Currency): Promise<number> {
    if (currency === "MMK") return amount;
    const rate = await ExchangeRateService.getRate(currency);
    return amount * rate;
  },
};
