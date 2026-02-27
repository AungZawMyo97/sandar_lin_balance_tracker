"use server";

import { SupplierRepository } from "@/app/repositories/supplierRepository";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSupplierAction(
  prevState: { error?: string },
  formData: FormData
) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name) return { error: "Name is required" };

  try {
    await SupplierRepository.create(name, phone);
    revalidatePath("/transactions/create");
    revalidatePath("/suppliers");
  } catch (_error) {
    return { error: "Failed to create supplier" };
  }

  redirect("/transactions/create");
}
