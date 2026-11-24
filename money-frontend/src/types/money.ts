export type AccountType = 'Cash' | 'Card' | 'Bank';
export type TransactionKind = 'Income' | 'Expense';

export interface CreateAccountDto {
  name: string;
  type: AccountType;
}

export interface AccountDto {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
}

export interface AccountsSummaryDto {
  totalBalance: number;
  accounts: AccountDto[];
}

export interface CreateTransactionDto {
  amount: number;
  kind: TransactionKind;
  category?: string | null;
  note?: string | null;
  date: string;
  accountId: number;
}

export interface TransactionDto {
  id: number;
  amount: number;
  kind: TransactionKind;
  category: string | null;
  note: string | null;
  date: string;
  accountId: number;
}

export interface SummaryDto {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}