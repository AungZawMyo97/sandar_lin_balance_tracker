"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { DailyClosingRepository } from "@/app/repositories/dailyClosingRepository";
import { ProfitService } from "@/app/services/profitService";
import prisma from "@/lib/db";

const createClosingSchema = z.object({
  accountId: z.coerce.number(),
  actualBalance: z.coerce.number(),
  note: z.string().optional(),
});

export async function createDailyClosingAction(
  prevState: unknown,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized", success: false };

  const parsed = createClosingSchema.safeParse({
    accountId: formData.get("accountId"),
    actualBalance: formData.get("actualBalance"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: "Invalid input", success: false };
  }

  const { accountId, actualBalance, note } = parsed.data;

  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) return { error: "Account not found", success: false };

    const systemBalance = Number(account.balance);
    const difference = actualBalance - systemBalance;

    const existing = await DailyClosingRepository.getTodayClosing(accountId);
    if (existing) {
      return { error: "This account is already closed for today.", success: false };
    }

    const today = new Date();
    const profitPerDayMMK = await ProfitService.calculateDailyProfitMMK(
      accountId,
      today
    );

    await DailyClosingRepository.create({
      accountId,
      systemBalance,
      actualCashBalance: actualBalance,
      difference,
      profitPerDayMMK,
      note,
    });

    revalidatePath("/closings");
    revalidatePath("/accounts");
    return { success: true, error: "" };
  } catch (error) {
    console.error("Closing Error:", error);
    return { error: "Failed to create closing record", success: false };
  }
}
