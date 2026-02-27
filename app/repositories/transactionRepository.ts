import prisma from "@/lib/db";

export type CreateExchangeInput = {
  fromAccountId: number;
  toAccountId: number;
  amountOut: number;
  amountIn: number;
  exchangeRate: number;
  customerName?: string;
  note?: string;
};

export type CreateCrossExchangeInput = {
  supplierId: number;
  foreignCurrency: string;
  foreignAmount: number;
  bridgeAccountId: number;
  bridgeAmount: number;
  supplierRate: number;
  targetAccountId: number;
  targetAmount: number;
  customerRate: number;
  type: "FOREIGN_TO_HELD" | "HELD_TO_FOREIGN";
  note?: string;
};

export const TransactionRepository = {
  async createExchange(data: CreateExchangeInput) {
    return await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: data.fromAccountId },
        data: { balance: { decrement: data.amountOut } },
      });

      await tx.account.update({
        where: { id: data.toAccountId },
        data: { balance: { increment: data.amountIn } },
      });

      return await tx.exchangeTransaction.create({
        data: {
          fromAccountId: data.fromAccountId,
          toAccountId: data.toAccountId,
          amountOut: data.amountOut,
          amountIn: data.amountIn,
          exchangeRate: data.exchangeRate,
          customerName: data.customerName,
          note: data.note,
        },
      });
    });
  },

  async createCrossTransaction(data: CreateCrossExchangeInput) {
    return await prisma.$transaction(async (tx) => {
      if (data.type === "FOREIGN_TO_HELD") {
        await tx.account.update({
          where: { id: data.targetAccountId },
          data: { balance: { decrement: data.targetAmount } },
        });

        await tx.account.update({
          where: { id: data.bridgeAccountId },
          data: { balance: { increment: data.bridgeAmount } },
        });
      } else {
        await tx.account.update({
          where: { id: data.targetAccountId },
          data: { balance: { increment: data.targetAmount } },
        });

        await tx.account.update({
          where: { id: data.bridgeAccountId },
          data: { balance: { decrement: data.bridgeAmount } },
        });
      }

      return await tx.crossTransaction.create({
        data: {
          supplierId: data.supplierId,
          foreignCurrency: data.foreignCurrency,
          foreignAmount: data.foreignAmount,
          bridgeAccountId: data.bridgeAccountId,
          bridgeAmount: data.bridgeAmount,
          supplierRate: data.supplierRate,
          targetAccountId: data.targetAccountId,
          targetAmount: data.targetAmount,
          customerRate: data.customerRate,
          type: data.type,
          note: data.note,
        },
      });
    });
  },

  async getHistory(
    userId: number,
    params: { page?: number; limit?: number }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;

    const standardTxns = await prisma.exchangeTransaction.findMany({
      where: { fromAccount: { userId } },
      include: { fromAccount: true, toAccount: true },
      orderBy: { createdAt: "desc" },
      take: limit * page,
    });

    const crossTxns = await prisma.crossTransaction.findMany({
      where: { bridgeAccount: { userId } },
      include: { supplier: true, bridgeAccount: true, targetAccount: true },
      orderBy: { createdAt: "desc" },
      take: limit * page,
    });

    const all = [
      ...standardTxns.map((t) => ({ ...t, kind: "STANDARD" as const })),
      ...crossTxns.map((t) => ({ ...t, kind: "CROSS" as const })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = all.length;
    const paginated = all.slice((page - 1) * limit, page * limit);

    const serialized = paginated.map((txn) => {
      if (txn.kind === "STANDARD") {
        return {
          ...txn,
          amountOut: Number(txn.amountOut),
          amountIn: Number(txn.amountIn),
          exchangeRate: Number(txn.exchangeRate),
          fromAccount: {
            ...txn.fromAccount,
            balance: Number(txn.fromAccount.balance),
          },
          toAccount: {
            ...txn.toAccount,
            balance: Number(txn.toAccount.balance),
          },
        };
      } else {
        return {
          ...txn,
          foreignAmount: Number(txn.foreignAmount),
          bridgeAmount: Number(txn.bridgeAmount),
          supplierRate: Number(txn.supplierRate),
          targetAmount: Number(txn.targetAmount),
          customerRate: Number(txn.customerRate),
          bridgeAccount: {
            ...txn.bridgeAccount,
            balance: Number(txn.bridgeAccount.balance),
          },
          targetAccount: {
            ...txn.targetAccount,
            balance: Number(txn.targetAccount.balance),
          },
        };
      }
    });

    return {
      data: serialized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(userId: number, id: number, type: "STANDARD" | "CROSS") {
    if (type === "STANDARD") {
      const txn = await prisma.exchangeTransaction.findUnique({
        where: { id },
        include: { fromAccount: true, toAccount: true },
      });
      if (!txn || txn.fromAccount.userId !== userId) return null;

      return {
        ...txn,
        kind: "STANDARD" as const,
        amountOut: Number(txn.amountOut),
        amountIn: Number(txn.amountIn),
        exchangeRate: Number(txn.exchangeRate),
        fromAccount: {
          ...txn.fromAccount,
          balance: Number(txn.fromAccount.balance),
        },
        toAccount: {
          ...txn.toAccount,
          balance: Number(txn.toAccount.balance),
        },
      };
    } else {
      const txn = await prisma.crossTransaction.findUnique({
        where: { id },
        include: { supplier: true, bridgeAccount: true, targetAccount: true },
      });
      if (!txn || txn.bridgeAccount.userId !== userId) return null;

      return {
        ...txn,
        kind: "CROSS" as const,
        foreignAmount: Number(txn.foreignAmount),
        bridgeAmount: Number(txn.bridgeAmount),
        supplierRate: Number(txn.supplierRate),
        targetAmount: Number(txn.targetAmount),
        customerRate: Number(txn.customerRate),
        bridgeAccount: {
          ...txn.bridgeAccount,
          balance: Number(txn.bridgeAccount.balance),
        },
        targetAccount: {
          ...txn.targetAccount,
          balance: Number(txn.targetAccount.balance),
        },
      };
    }
  },
};
