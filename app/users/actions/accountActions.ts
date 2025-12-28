"use server";

import { z } from "zod";
import { Currency } from "@/app/lib/enums";
import { createAccountSchema } from "@/lib/schemas";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createAccountAction(
  values: z.infer<typeof createAccountSchema>
) {
  const userId = await getCurrentUser();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const validated = createAccountSchema.safeParse(values);
  if (!validated.success) {
    return { error: "Invalid input fields" };
  }

  const { name, currency, balance } = validated.data;

  try {
    await prisma.account.create({
      data: {
        userId: parseInt(userId),
        name,
        currency: currency as Currency,
        balance,
        status: "ACTIVE",
      },
    });

    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Create Account Error:", error);
    return { error: "Failed to create account. Name might be duplicate." };
  }
}
