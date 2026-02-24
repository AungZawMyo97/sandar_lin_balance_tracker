import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { Currency } from "@/app/lib/enums";

export class ExchangeRateRepository {
    static async getAll() {
        return await prisma.exchangeRate.findMany({
            orderBy: { currency: "asc" },
        });
    }

    static async getByCurrency(currency: Currency) {
        return await prisma.exchangeRate.findUnique({
            where: { currency: currency as any },
        });
    }

    static async getRatesMap(): Promise<Record<Currency, number>> {
        const rates = await this.getAll();
        const map: Record<string, number> = { MMK: 1 }; // MMK is always 1
        
        rates.forEach(rate => {
            map[rate.currency] = Number(rate.rate);
        });

        return map as Record<Currency, number>;
    }

    static async getRatesFromMMKMap(): Promise<Record<Currency, number>> {
        const rates = await this.getAll();
        const map: Record<string, number> = { MMK: 1 };
        
        rates.forEach(rate => {
            map[rate.currency] = Number(rate.rateFromMMK);
        });

        return map as Record<Currency, number>;
    }

    static async upsert(currency: Currency, rate: number, rateFromMMK?: number) {
        const updateData: any = { rate: new Prisma.Decimal(rate) };
        const createData: any = {
            currency: currency as any,
            rate: new Prisma.Decimal(rate),
        };

        if (rateFromMMK !== undefined) {
            updateData.rateFromMMK = new Prisma.Decimal(rateFromMMK);
            createData.rateFromMMK = new Prisma.Decimal(rateFromMMK);
        }

        return await prisma.exchangeRate.upsert({
            where: { currency: currency as any },
            update: updateData,
            create: createData,
        });
    }

    static async upsertMany(rates: Array<{ currency: Currency; rate: number; rateFromMMK: number }>) {
        return await prisma.$transaction(
            rates.map(({ currency, rate, rateFromMMK }) =>
                prisma.exchangeRate.upsert({
                    where: { currency: currency as any },
                    update: {
                        rate: new Prisma.Decimal(rate),
                        rateFromMMK: new Prisma.Decimal(rateFromMMK),
                    },
                    create: {
                        currency: currency as any,
                        rate: new Prisma.Decimal(rate),
                        rateFromMMK: new Prisma.Decimal(rateFromMMK),
                    },
                })
            )
        );
    }
}
