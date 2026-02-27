import { Currency, Role, Status, AccountStatus, DebtStatus, CrossType } from "@/lib/enums";

export interface SerializedAccount {
  id: number;
  userId: number;
  currency: Currency;
  name: string | null;
  balance: number;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedUser {
  id: number;
  phone: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  status: Status;
  lastLogin: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionKind = "STANDARD" | "CROSS" | "BROKERED";

export interface SerializedStandardTransaction {
  id: number;
  kind: "STANDARD";
  fromAccountId: number;
  toAccountId: number;
  amountOut: number;
  amountIn: number;
  exchangeRate: number;
  customerName: string | null;
  note: string | null;
  createdAt: Date;
  fromAccount: SerializedAccount;
  toAccount: SerializedAccount;
}

export interface SerializedCrossTransaction {
  id: number;
  kind: "CROSS";
  supplierId: number;
  foreignCurrency: string;
  foreignAmount: number;
  bridgeAccountId: number;
  bridgeAmount: number;
  supplierRate: number;
  targetAccountId: number;
  targetAmount: number;
  customerRate: number;
  type: CrossType;
  note: string | null;
  createdAt: Date;
  supplier: { id: number; name: string; phone: string | null };
  bridgeAccount: SerializedAccount;
  targetAccount: SerializedAccount;
}

export interface SerializedBrokeredTransaction {
  id: number;
  kind: "BROKERED";
  profitAccountId: number;
  supplierId: number;
  foreignCurrency: string;
  foreignAmount: number;
  supplierRate: number;
  customerRate: number;
  netProfit: number;
  note: string | null;
  createdAt: Date;
  profitAccount: SerializedAccount;
  supplier: { id: number; name: string };
}

export type SerializedTransaction =
  | SerializedStandardTransaction
  | SerializedCrossTransaction
  | SerializedBrokeredTransaction;

export interface SerializedSupplier {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}

export interface SerializedExchangeRate {
  id: number;
  currency: Currency;
  rate: number;
  rateFromMMK: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface SerializedDailyClosing {
  id: number;
  accountId: number;
  closingDate: Date;
  systemBalance: number;
  actualCashBalance: number;
  difference: number;
  profitPerDayMMK: number | null;
  note: string | null;
  account: SerializedAccount;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExchangeFormInput {
  fromAccountId: number;
  toAccountId: number;
  amountOut: number;
  amountIn: number;
  exchangeRate: number;
  customerName?: string;
  note?: string;
}

export interface CrossExchangeFormInput {
  supplierId: number;
  foreignCurrency: string;
  foreignAmount: number;
  bridgeAccountId: number;
  bridgeAmount: number;
  supplierRate: number;
  targetAccountId: number;
  targetAmount: number;
  customerRate: number;
  type: CrossType;
  note?: string;
}
