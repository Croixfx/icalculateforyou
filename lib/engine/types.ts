export type RateType = "nominal" | "effective";

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface PayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: AmortizationRow[];
}

export interface Debt {
  id: string;
  balance: number;
  annualRate: number;
  rateType: RateType;
  minPayment: number;
}

export type MultiDebtStrategy = "avalanche" | "snowball";

export interface DebtPayoffEntry {
  id: string;
  payoffMonth: number;
  totalInterest: number;
}

export interface TotalBalanceRow {
  month: number;
  totalBalance: number;
}

export interface MultiDebtPlan {
  order: string[];
  debts: DebtPayoffEntry[];
  totalInterest: number;
  debtFreeMonth: number;
  schedule: TotalBalanceRow[];
}
