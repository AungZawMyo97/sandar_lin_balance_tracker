export enum Role {
  USER = "USER",
  PREMIUM = "PREMIUM",
  ADMIN = "ADMIN",
}

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  FREEZE = "FREEZE",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  FREEZE = "FREEZE",
  DELETED = "DELETED",
}

export enum DebtStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  BAD_DEBT = "BAD_DEBT",
}

export enum CrossType {
  FOREIGN_TO_HELD = "FOREIGN_TO_HELD",
  HELD_TO_FOREIGN = "HELD_TO_FOREIGN",
}

export enum Currency {
  MMK = "MMK",
  THB = "THB",
  USD = "USD",
  SGD = "SGD",
  EUR = "EUR",
  JPY = "JPY",
  CNY = "CNY",
  AED = "AED",
  MYR = "MYR",
}
