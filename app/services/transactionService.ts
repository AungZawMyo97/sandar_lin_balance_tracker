import { TransactionRepository, CreateExchangeInput, CreateCrossExchangeInput } from "@/app/repositories/transactionRepository";
import { AccountRepository } from "@/app/repositories/accountRepository";

export const TransactionService = {
    async createExchange(userId: number, data: CreateExchangeInput) {
        // 1. Validation: Ensure user owns the accounts (Security)
        const accounts = await AccountRepository.findByUserId(userId);
        const validIds = new Set(accounts.map((a) => a.id));

        if (!validIds.has(data.fromAccountId) || !validIds.has(data.toAccountId)) {
            throw new Error("Unauthorized access to account");
        }

        if (data.fromAccountId === data.toAccountId) {
            throw new Error("Cannot transfer to the same account");
        }

        // 2. Validation: Check Sufficient Balance
        const fromAccount = accounts.find((a) => a.id === data.fromAccountId);
        if (!fromAccount) throw new Error("Source account not found");

        // Optional: Allow negative balance? Usually physical drawers shouldn't go negative.
        // For now, let's strictly enforce non-negative for physical cash drawers.
        if (Number(fromAccount.balance) < data.amountOut) {
            throw new Error(`Insufficient funds in ${fromAccount.name}`);
        }

        // 3. Execute Transaction
        return await TransactionRepository.createExchange(data);
    },

    async createCrossTransaction(userId: number, data: CreateCrossExchangeInput) {
        // Validate ownership
        const accounts = await AccountRepository.findByUserId(userId);
        const validIds = new Set(accounts.map((a) => a.id));
        if (!validIds.has(data.bridgeAccountId) || !validIds.has(data.targetAccountId)) {
            throw new Error("Unauthorized access to account");
        }

        // Validate Balances
        if (data.type === "FOREIGN_TO_HELD") {
            // We give THB (Target) -> Check Target Balance
            const target = accounts.find(a => a.id === data.targetAccountId);
            if (!target || Number(target.balance) < data.targetAmount) {
                throw new Error("Insufficient funds in Target Account");
            }
        } else {
            // We pay MMK (Bridge) -> Check Bridge Balance
            const bridge = accounts.find(a => a.id === data.bridgeAccountId);
            if (!bridge || Number(bridge.balance) < data.bridgeAmount) {
                throw new Error("Insufficient funds in Bridge Account");
            }
        }

        return await TransactionRepository.createCrossTransaction(data);
    },
    async getHistory(userId: number, params: { page?: number; limit?: number; startDate?: Date; endDate?: Date }) {
        return await TransactionRepository.getHistory(userId, params);
    },
};
