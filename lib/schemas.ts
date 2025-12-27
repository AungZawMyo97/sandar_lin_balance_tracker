import * as z from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(15, { message: "Phone number must be at most 15 digits." }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .max(32, {
      message: "Password must be at most 32 characters.",
    }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const currencies = [
  "MMK",
  "THB",
  "USD",
  "SGD",
  "EUR",
  "JPY",
  "CNY",
  "AED",
  "MYR",
] as const;

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  currency: z.enum(currencies, {
    errorMap: () => ({ message: "Please select a valid currency" }),
  }),
  balance: z.coerce.number().default(0),
});

export type CreateAccountValues = z.infer<typeof createAccountSchema>;
