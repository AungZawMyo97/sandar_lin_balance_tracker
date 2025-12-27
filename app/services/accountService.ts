import { AccountRepository } from "@/app/repositories/accountRepository";
import { Currency } from "@/app/lib/enums";

export const AccountService = {
    async getUserAccounts(userId: number) {
        return await AccountRepository.findByUserId(userId);
    },

    async getTotalBalance(userId: number, currency: Currency) {
        const accounts = await AccountRepository.findByUserIdAndCurrency(userId, currency);
        return accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
    },
};
