"use server";

import { z } from "zod";
import { loginSchema } from "@/lib/schemas";
import { AuthService } from "@/app/services/authService";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

export async function loginAction(values: z.infer<typeof loginSchema>) {
  // 1. Validate Fields
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { phone, password } = validatedFields.data;

  // 2. Call Service
  const user = await AuthService.login(phone, password);

  if (!user) {
    return { error: "Invalid phone number or password" };
  }

  // 3. Create Session
  await createSession(user.id.toString());

  // 4. Redirect (Must be outside try/catch blocks in Next.js)
  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
