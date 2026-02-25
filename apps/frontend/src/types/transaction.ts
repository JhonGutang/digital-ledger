export type TransactionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'POSTED' | 'VOIDED';
export type EntryType = 'DEBIT' | 'CREDIT';

export interface TransactionEntry {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  entryType: EntryType;
  description?: string;
}

export interface Transaction {
  id: string;
  referenceNumber?: string;
  description: string;
  date: string; // ISO string form
  status: TransactionStatus;
  createdBy: string;
  creatorName?: string;
  approvedBy?: string;
  approverName?: string;
  createdAt: string;
  updatedAt: string;
  entries: TransactionEntry[];
}

export interface CreateTransactionEntryDto {
  accountId: string;
  amount: number;
  entryType: EntryType;
  description?: string;
}

export interface UpdateTransactionEntryDto {
  id?: string;
  accountId: string;
  amount: number;
  entryType: EntryType;
  description?: string;
}

export interface CreateTransactionDto {
  referenceNumber?: string;
  description: string;
  date: string;
  status: TransactionStatus;
  entries: CreateTransactionEntryDto[];
}

export interface UpdateTransactionDto {
  referenceNumber?: string;
  description: string;
  date: string;
  status: TransactionStatus;
  entries: UpdateTransactionEntryDto[];
}
