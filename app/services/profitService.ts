import prisma from "@/lib/db";
import { ExchangeRateService } from "./exchangeRateService";
import { Currency } from "@/app/lib/enums";

export class ProfitService {
    /**
     * Calculate profit for a specific day in MMK
     * This includes:
     * - BrokeredTransaction profits (already in MMK or needs conversion)
     * - ExchangeTransaction profits (spread between buy/sell rates)
     * - CrossTransaction profits (spread between supplier and customer rates)
     */
    static async calculateDailyProfitMMK(
        accountId: number,
        date: Date
    ): Promise<number> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const rates = await ExchangeRateService.getRatesMap();

        let totalProfitMMK = 0;

        // 1. BrokeredTransaction profits (netProfit is already in MMK)
        const brokeredTxns = await prisma.brokeredTransaction.findMany({
            where: {
                profitAccountId: accountId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        brokeredTxns.forEach((txn) => {
            totalProfitMMK += Number(txn.netProfit);
        });

        // 2. ExchangeTransaction profits (spread calculation)
        const exchangeTxns = await prisma.exchangeTransaction.findMany({
            where: {
                OR: [
                    { fromAccountId: accountId },
                    { toAccountId: accountId },
                ],
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                fromAccount: true,
                toAccount: true,
            },
        });

        exchangeTxns.forEach((txn) => {
            const fromCurrency = txn.fromAccount.currency as Currency;
            const toCurrency = txn.toAccount.currency as Currency;

            // If MMK is involved, calculate profit directly
            if (fromCurrency === "MMK" || toCurrency === "MMK") {
                // When selling foreign currency (MMK -> Foreign), profit is the spread
                // When buying foreign currency (Foreign -> MMK), profit is the spread
                // The profit is the difference between what we should get vs what we actually got
                const amountOutMMK = fromCurrency === "MMK" 
                    ? Number(txn.amountOut)
                    : Number(txn.amountOut) * (rates[fromCurrency] || 1);
                
                const amountInMMK = toCurrency === "MMK"
                    ? Number(txn.amountIn)
                    : Number(txn.amountIn) * (rates[toCurrency] || 1);

                // Profit is the difference (positive means we made money)
                const profit = amountInMMK - amountOutMMK;
                totalProfitMMK += profit;
            } else {
                // Both are foreign currencies - convert both to MMK and calculate
                const amountOutMMK = Number(txn.amountOut) * (rates[fromCurrency] || 1);
                const amountInMMK = Number(txn.amountIn) * (rates[toCurrency] || 1);
                const profit = amountInMMK - amountOutMMK;
                totalProfitMMK += profit;
            }
        });

        // 3. CrossTransaction profits
        const crossTxns = await prisma.crossTransaction.findMany({
            where: {
                OR: [
                    { bridgeAccountId: accountId },
                    { targetAccountId: accountId },
                ],
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                bridgeAccount: true,
                targetAccount: true,
            },
        });

        crossTxns.forEach((txn) => {
            // Calculate profit from the spread between supplier and customer rates
            const foreignAmount = Number(txn.foreignAmount);
            const supplierCostMMK = foreignAmount * Number(txn.supplierRate);
            const customerRevenueMMK = foreignAmount * Number(txn.customerRate);
            const profit = customerRevenueMMK - supplierCostMMK;
            totalProfitMMK += profit;
        });

        return totalProfitMMK;
    }

    /**
     * Calculate profit for a date range
     */
    static async calculateProfitRangeMMK(
        accountId: number,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        let total = 0;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayProfit = await this.calculateDailyProfitMMK(accountId, currentDate);
            total += dayProfit;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return total;
    }
}
