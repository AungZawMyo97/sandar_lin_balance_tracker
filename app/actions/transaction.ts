"use server";

import { getCurrentUser } from "@/lib/session";
import { TransactionService } from "@/app/services/transactionService";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTransactionAction(formData: FormData) {
    const userId = await getCurrentUser();
    if (!userId) throw new Error("Unauthorized");

    // Check Transaction Type
    const transactionMode = formData.get("transactionMode") as string; // "STANDARD" | "CROSS"

    const customerName = formData.get("customerName") as string;
    const note = formData.get("note") as string;

    try {
        if (transactionMode === "CROSS") {
            const supplierId = parseInt(formData.get("supplierId") as string);
            const foreignCurrency = formData.get("foreignCurrency") as string;
            const foreignAmount = parseFloat(formData.get("foreignAmount") as string);
            const bridgeAccountId = parseInt(formData.get("bridgeAccountId") as string);
            const bridgeAmount = parseFloat(formData.get("bridgeAmount") as string);
            const supplierRate = parseFloat(formData.get("supplierRate") as string);
            const targetAccountId = parseInt(formData.get("targetAccountId") as string);
            const targetAmount = parseFloat(formData.get("targetAmount") as string);
            const customerRate = parseFloat(formData.get("customerRate") as string);
            const type = formData.get("crossType") as "FOREIGN_TO_HELD" | "HELD_TO_FOREIGN";

            await TransactionService.createCrossTransaction(parseInt(userId), {
                supplierId,
                foreignCurrency,
                foreignAmount,
                bridgeAccountId,
                bridgeAmount,
                supplierRate,
                targetAccountId,
                targetAmount,
                customerRate,
                type,
                note
            });

        } else {
            // STANDARD
            const fromAccountId = parseInt(formData.get("fromAccountId") as string);
            const toAccountId = parseInt(formData.get("toAccountId") as string);
            const amountOut = parseFloat(formData.get("amountOut") as string);
            const amountIn = parseFloat(formData.get("amountIn") as string);
            const exchangeRate = parseFloat(formData.get("exchangeRate") as string);

            await TransactionService.createExchange(parseInt(userId), {
                fromAccountId,
                toAccountId,
                amountOut,
                amountIn,
                exchangeRate,
                customerName,
                note,
            });
        }

        revalidatePath("/");
        revalidatePath("/transactions");
        revalidatePath("/accounts");
    } catch (error) {
        console.error(error);
        return { error: error instanceof Error ? error.message : "Failed to create transaction" };
    }

    redirect("/");
}
