import {
  TransactionRepository,
  CreateExchangeInput,
  CreateCrossExchangeInput,
} from "@/app/repositories/transactionRepository";
import { AccountRepository } from "@/app/repositories/accountRepository";

export const TransactionService = {
  async createExchange(userId: number, data: CreateExchangeInput) {
    const accounts = await AccountRepository.findByUserId(userId);
    const validIds = new Set(accounts.map((a) => a.id));

    if (!validIds.has(data.fromAccountId) || !validIds.has(data.toAccountId)) {
      throw new Error("Unauthorized access to account");
    }

    if (data.fromAccountId === data.toAccountId) {
      throw new Error("Cannot transfer to the same account");
    }

    const fromAccount = accounts.find((a) => a.id === data.fromAccountId);
    if (!fromAccount) throw new Error("Source account not found");

    if (Number(fromAccount.balance) < data.amountOut) {
      throw new Error(`Insufficient funds in ${fromAccount.name}`);
    }

    return await TransactionRepository.createExchange(data);
  },

  async createCrossTransaction(
    userId: number,
    data: CreateCrossExchangeInput
  ) {
    const accounts = await AccountRepository.findByUserId(userId);
    const validIds = new Set(accounts.map((a) => a.id));
    if (
      !validIds.has(data.bridgeAccountId) ||
      !validIds.has(data.targetAccountId)
    ) {
      throw new Error("Unauthorized access to account");
    }

    if (data.type === "FOREIGN_TO_HELD") {
      const target = accounts.find((a) => a.id === data.targetAccountId);
      if (!target || Number(target.balance) < data.targetAmount) {
        throw new Error("Insufficient funds in Target Account");
      }
    } else {
      const bridge = accounts.find((a) => a.id === data.bridgeAccountId);
      if (!bridge || Number(bridge.balance) < data.bridgeAmount) {
        throw new Error("Insufficient funds in Bridge Account");
      }
    }

    return await TransactionRepository.createCrossTransaction(data);
  },

  async getHistory(
    userId: number,
    params: { page?: number; limit?: number; startDate?: Date; endDate?: Date }
  ) {
    return await TransactionRepository.getHistory(userId, params);
  },

  async getTransaction(
    userId: number,
    id: number,
    type: "STANDARD" | "CROSS"
  ) {
    return await TransactionRepository.findById(userId, id, type);
  },
};
