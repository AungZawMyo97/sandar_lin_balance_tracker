"use server";

import { z } from "zod";
import { loginSchema } from "@/lib/schemas";
import { AuthService } from "@/app/services/authService";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { phone, password } = validatedFields.data;

  const user = await AuthService.login(phone, password);

  if (!user) {
    return { error: "Invalid phone number or password" };
  }

  await createSession(user.id.toString());
  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
