import prisma from "@/lib/db";
import { Currency as PrismaCurrency } from "@/app/generated/prisma/client";
import { Currency } from "@/lib/enums";

export const AccountRepository = {
  async findByUserId(userId: number) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        dailyClosings: {
          take: 1,
          orderBy: { closingDate: "desc" },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return accounts.map((account) => ({
      ...account,
      balance: Number(account.balance),
      dailyClosings: account.dailyClosings.map((dc) => ({
        ...dc,
        systemBalance: Number(dc.systemBalance),
        actualCashBalance: Number(dc.actualCashBalance),
        difference: Number(dc.difference),
        profitPerDayMMK: dc.profitPerDayMMK ? Number(dc.profitPerDayMMK) : null,
      })),
    }));
  },

  async findByUserIdAndCurrency(userId: number, currency: Currency) {
    const accounts = await prisma.account.findMany({
      where: { userId, currency: currency as unknown as PrismaCurrency },
    });

    return accounts.map((a) => ({
      ...a,
      balance: Number(a.balance),
    }));
  },
};
