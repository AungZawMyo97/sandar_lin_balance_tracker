import prisma from "@/lib/db";
import { ExchangeRateService } from "./exchangeRateService";
import { Currency } from "@/lib/enums";

export const ProfitService = {
  async calculateDailyProfitMMK(
    accountId: number,
    date: Date
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rates = await ExchangeRateService.getRatesMap();

    let totalProfitMMK = 0;

    const brokeredTxns = await prisma.brokeredTransaction.findMany({
      where: {
        profitAccountId: accountId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    brokeredTxns.forEach((txn) => {
      totalProfitMMK += Number(txn.netProfit);
    });

    const exchangeTxns = await prisma.exchangeTransaction.findMany({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId },
        ],
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { fromAccount: true, toAccount: true },
    });

    exchangeTxns.forEach((txn) => {
      const fromCurrency = txn.fromAccount.currency as Currency;
      const toCurrency = txn.toAccount.currency as Currency;

      const amountOutMMK =
        fromCurrency === "MMK"
          ? Number(txn.amountOut)
          : Number(txn.amountOut) * (rates[fromCurrency] || 1);

      const amountInMMK =
        toCurrency === "MMK"
          ? Number(txn.amountIn)
          : Number(txn.amountIn) * (rates[toCurrency] || 1);

      totalProfitMMK += amountInMMK - amountOutMMK;
    });

    const crossTxns = await prisma.crossTransaction.findMany({
      where: {
        OR: [
          { bridgeAccountId: accountId },
          { targetAccountId: accountId },
        ],
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { bridgeAccount: true, targetAccount: true },
    });

    crossTxns.forEach((txn) => {
      const foreignAmount = Number(txn.foreignAmount);
      const supplierCostMMK = foreignAmount * Number(txn.supplierRate);
      const customerRevenueMMK = foreignAmount * Number(txn.customerRate);
      totalProfitMMK += customerRevenueMMK - supplierCostMMK;
    });

    return totalProfitMMK;
  },

  async calculateProfitRangeMMK(
    accountId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    let total = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayProfit = await ProfitService.calculateDailyProfitMMK(
        accountId,
        currentDate
      );
      total += dayProfit;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return total;
  },
};
