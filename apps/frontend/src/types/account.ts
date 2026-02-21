export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface Account {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAccountDto {
  code: string;
  name: string;
  category: AccountCategory;
  description?: string;
}

export interface UpdateAccountDto {
  name: string;
  description?: string;
}
