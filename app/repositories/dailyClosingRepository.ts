import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";

export const DailyClosingRepository = {
  async create(data: {
    accountId: number;
    systemBalance: number;
    actualCashBalance: number;
    difference: number;
    profitPerDayMMK?: number;
    note?: string;
  }) {
    const result = await prisma.dailyClosing.create({
      data: {
        accountId: data.accountId,
        systemBalance: new Prisma.Decimal(data.systemBalance),
        actualCashBalance: new Prisma.Decimal(data.actualCashBalance),
        difference: new Prisma.Decimal(data.difference),
        profitPerDayMMK:
          data.profitPerDayMMK !== undefined
            ? new Prisma.Decimal(data.profitPerDayMMK)
            : null,
        note: data.note,
      },
    });

    return {
      ...result,
      systemBalance: Number(result.systemBalance),
      actualCashBalance: Number(result.actualCashBalance),
      difference: Number(result.difference),
      profitPerDayMMK: result.profitPerDayMMK
        ? Number(result.profitPerDayMMK)
        : null,
    };
  },

  async getHistory(userId: number, limit = 20) {
    const history = await prisma.dailyClosing.findMany({
      where: {
        account: {
          userId: userId,
        },
      },
      include: {
        account: {
          select: {
            name: true,
            currency: true,
          },
        },
      },
      orderBy: {
        closingDate: "desc",
      },
      take: limit,
    });

    return history.map((record) => ({
      ...record,
      systemBalance: Number(record.systemBalance),
      actualCashBalance: Number(record.actualCashBalance),
      difference: Number(record.difference),
      profitPerDayMMK: record.profitPerDayMMK
        ? Number(record.profitPerDayMMK)
        : null,
    }));
  },

  async getTodayClosing(accountId: number) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.dailyClosing.findFirst({
      where: {
        accountId: accountId,
        closingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  },
};
