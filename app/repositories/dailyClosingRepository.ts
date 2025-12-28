import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";

export class DailyClosingRepository {
    static async create(data: {
        accountId: number;
        systemBalance: number;
        actualCashBalance: number; // Keeping DB field name as is, but logic handles it as Actual Balance
        difference: number;
        note?: string;
    }) {
        return await prisma.dailyClosing.create({
            data: {
                accountId: data.accountId,
                systemBalance: new Prisma.Decimal(data.systemBalance),
                actualCashBalance: new Prisma.Decimal(data.actualCashBalance),
                difference: new Prisma.Decimal(data.difference),
                note: data.note,
            },
        });
    }

    static async getHistory(userId: number, limit = 20) {
        return await prisma.dailyClosing.findMany({
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
    }

    static async getTodayClosing(accountId: number) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return await prisma.dailyClosing.findFirst({
            where: {
                accountId: accountId,
                closingDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        })
    }
}
