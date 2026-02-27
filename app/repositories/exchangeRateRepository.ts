import prisma from "@/lib/db";
import { Prisma, Currency as PrismaCurrency } from "@/app/generated/prisma/client";
import { Currency } from "@/lib/enums";

export const ExchangeRateRepository = {
  async getAll() {
    return await prisma.exchangeRate.findMany({
      orderBy: { currency: "asc" },
    });
  },

  async getByCurrency(currency: Currency) {
    return await prisma.exchangeRate.findUnique({
      where: { currency: currency as unknown as PrismaCurrency },
    });
  },

  async getRatesMap(): Promise<Record<Currency, number>> {
    const rates = await ExchangeRateRepository.getAll();
    const map: Record<string, number> = { MMK: 1 };

    rates.forEach((rate) => {
      map[rate.currency] = Number(rate.rate);
    });

    return map as Record<Currency, number>;
  },

  async getSellRatesMap(): Promise<Record<Currency, number>> {
    const rates = await ExchangeRateRepository.getAll();
    const map: Record<string, number> = { MMK: 1 };

    rates.forEach((rate) => {
      map[rate.currency] = Number(rate.rateFromMMK);
    });

    return map as Record<Currency, number>;
  },

  async upsert(currency: Currency, rate: number, rateFromMMK?: number) {
    const updateData: Prisma.ExchangeRateUpdateInput = {
      rate: new Prisma.Decimal(rate),
    };
    const createData: Prisma.ExchangeRateCreateInput = {
      currency: currency as unknown as PrismaCurrency,
      rate: new Prisma.Decimal(rate),
    };

    if (rateFromMMK !== undefined) {
      updateData.rateFromMMK = new Prisma.Decimal(rateFromMMK);
      (createData as Record<string, unknown>).rateFromMMK = new Prisma.Decimal(rateFromMMK);
    }

    return await prisma.exchangeRate.upsert({
      where: { currency: currency as unknown as PrismaCurrency },
      update: updateData,
      create: createData,
    });
  },

  async upsertMany(
    rates: Array<{ currency: Currency; rate: number; rateFromMMK: number }>
  ) {
    return await prisma.$transaction(
      rates.map(({ currency, rate, rateFromMMK }) =>
        prisma.exchangeRate.upsert({
          where: { currency: currency as unknown as PrismaCurrency },
          update: {
            rate: new Prisma.Decimal(rate),
            rateFromMMK: new Prisma.Decimal(rateFromMMK),
          },
          create: {
            currency: currency as unknown as PrismaCurrency,
            rate: new Prisma.Decimal(rate),
            rateFromMMK: new Prisma.Decimal(rateFromMMK),
          },
        })
      )
    );
  },
};
