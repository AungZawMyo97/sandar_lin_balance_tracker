import { ExchangeRateRepository } from "@/app/repositories/exchangeRateRepository";
import { Currency } from "@/app/lib/enums";

export class ExchangeRateService {
    /** {currency} → MMK rates map */
    static async getRatesMap(): Promise<Record<Currency, number>> {
        return await ExchangeRateRepository.getRatesMap();
    }

    /** MMK → {currency} rates map */
    static async getRatesFromMMKMap(): Promise<Record<Currency, number>> {
        return await ExchangeRateRepository.getRatesFromMMKMap();
    }

    static async getRate(currency: Currency): Promise<number> {
        if (currency === "MMK") return 1;
        
        const rate = await ExchangeRateRepository.getByCurrency(currency);
        return rate ? Number(rate.rate) : 1;
    }

    static async updateRate(currency: Currency, rate: number, rateFromMMK?: number) {
        if (currency === "MMK") {
            throw new Error("Cannot update MMK rate (always 1)");
        }
        return await ExchangeRateRepository.upsert(currency, rate, rateFromMMK);
    }

    static async updateRates(rates: Array<{ currency: Currency; rate: number; rateFromMMK: number }>) {
        const filtered = rates.filter(r => r.currency !== "MMK");
        return await ExchangeRateRepository.upsertMany(filtered);
    }

    static async getAllRates() {
        return await ExchangeRateRepository.getAll();
    }

    static async convertToMMK(amount: number, currency: Currency): Promise<number> {
        if (currency === "MMK") return amount;
        const rate = await this.getRate(currency);
        return amount * rate;
    }
}
