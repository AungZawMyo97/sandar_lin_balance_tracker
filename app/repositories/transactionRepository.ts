import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";

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
            const fromAccount = await tx.account.update({
                where: { id: data.fromAccountId },
                data: { balance: { decrement: data.amountOut } },
            });

            const toAccount = await tx.account.update({
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

    async getHistory(userId: number, params: { page?: number; limit?: number }) {
        const page = params.page || 1;
        const limit = params.limit || 20;

        // Fetch STANDARD Transactions
        const standardTxns = await prisma.exchangeTransaction.findMany({
            where: { fromAccount: { userId } },
            include: { fromAccount: true, toAccount: true },
            orderBy: { createdAt: "desc" },
            take: limit * page,
        });

        // Fetch CROSS Transactions
        const crossTxns = await prisma.crossTransaction.findMany({
            where: { bridgeAccount: { userId } },
            include: { supplier: true, bridgeAccount: true, targetAccount: true },
            orderBy: { createdAt: "desc" },
            take: limit * page,
        });

        // Combine and Sort
        const all = [
            ...standardTxns.map(t => ({ ...t, kind: "STANDARD" })),
            ...crossTxns.map(t => ({ ...t, kind: "CROSS" }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Pagination
        const total = all.length;
        const paginated = all.slice((page - 1) * limit, page * limit);

        // Serialize for Client Component
        const serialized = paginated.map(txn => {
            if (txn.kind === "STANDARD") {
                const text = txn as any; // Cast to avoid complex union mapping issues inline
                return {
                    ...text,
                    amountOut: Number(text.amountOut),
                    amountIn: Number(text.amountIn),
                    exchangeRate: Number(text.exchangeRate),
                    fromAccount: { ...text.fromAccount, balance: Number(text.fromAccount.balance) },
                    toAccount: { ...text.toAccount, balance: Number(text.toAccount.balance) },
                };
            } else {
                const text = txn as any;
                return {
                    ...text,
                    foreignAmount: Number(text.foreignAmount),
                    bridgeAmount: Number(text.bridgeAmount),
                    supplierRate: Number(text.supplierRate),
                    targetAmount: Number(text.targetAmount),
                    customerRate: Number(text.customerRate),
                    bridgeAccount: { ...text.bridgeAccount, balance: Number(text.bridgeAccount.balance) },
                    targetAccount: { ...text.targetAccount, balance: Number(text.targetAccount.balance) },
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
                kind: "STANDARD",
                amountOut: Number(txn.amountOut),
                amountIn: Number(txn.amountIn),
                exchangeRate: Number(txn.exchangeRate),
                fromAccount: { ...txn.fromAccount, balance: Number(txn.fromAccount.balance) },
                toAccount: { ...txn.toAccount, balance: Number(txn.toAccount.balance) },
            };
        } else {
            const txn = await prisma.crossTransaction.findUnique({
                where: { id },
                include: { supplier: true, bridgeAccount: true, targetAccount: true },
            });
            if (!txn || txn.bridgeAccount.userId !== userId) return null;

            return {
                ...txn,
                kind: "CROSS",
                foreignAmount: Number(txn.foreignAmount),
                bridgeAmount: Number(txn.bridgeAmount),
                supplierRate: Number(txn.supplierRate),
                targetAmount: Number(txn.targetAmount),
                customerRate: Number(txn.customerRate),
                bridgeAccount: { ...txn.bridgeAccount, balance: Number(txn.bridgeAccount.balance) },
                targetAccount: { ...txn.targetAccount, balance: Number(txn.targetAccount.balance) },
            };
        }
    },
};
