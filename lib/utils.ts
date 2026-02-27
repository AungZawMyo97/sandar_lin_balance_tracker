import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decimalToNumber(
  value: { toString(): string } | number | null | undefined
): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function serializeDecimals<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      (result as Record<string, unknown>)[field as string] = decimalToNumber(
        result[field] as { toString(): string } | number
      );
    }
  }
  return result;
}

export type RateBasis = "UNIT" | "100K";

export function calculateMMKAmount(
  foreignAmount: number,
  rate: number,
  basis: RateBasis
): number {
  if (isNaN(foreignAmount) || isNaN(rate) || rate === 0) return 0;

  if (basis === "100K") {
    return (foreignAmount * 100000) / rate;
  }
  return rate * foreignAmount;
}

export function getDefaultRateBasis(currency: string): RateBasis {
  return currency === "THB" ? "100K" : "UNIT";
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationValues(params: PaginationParams): {
  skip: number;
  take: number;
  page: number;
  limit: number;
} {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
