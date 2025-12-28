"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { DailyClosingRepository } from "@/app/repositories/dailyClosingRepository";
import prisma from "@/lib/db";

const createClosingSchema = z.object({
    accountId: z.coerce.number(),
    actualBalance: z.coerce.number(),
    note: z.string().optional(),
});

export async function createDailyClosingAction(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    const parsed = createClosingSchema.safeParse({
        accountId: formData.get("accountId"),
        actualBalance: formData.get("actualBalance"),
        note: formData.get("note"),
    });

    if (!parsed.success) {
        return { error: "Invalid input" };
    }

    const { accountId, actualBalance, note } = parsed.data;

    try {
        // 1. Fetch current system balance
        const account = await prisma.account.findUnique({
            where: { id: accountId },
        });

        if (!account) return { error: "Account not found" };

        const systemBalance = Number(account.balance);
        const difference = actualBalance - systemBalance;

        // 2. Check if already closed today
        const existing = await DailyClosingRepository.getTodayClosing(accountId);
        if (existing) {
            return { error: "This account is already closed for today." };
        }

        // 3. Create Record
        await DailyClosingRepository.create({
            accountId,
            systemBalance,
            actualCashBalance: actualBalance,
            difference,
            note,
        });

        revalidatePath("/closings");
        return { success: true };
    } catch (error) {
        console.error("Closing Error:", error);
        return { error: "Failed to create closing record" };
    }
}
