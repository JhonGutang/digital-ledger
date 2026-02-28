import api from '@/services/api';

export interface CsvEntryDto {
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export interface BalanceCheckResultDto {
  isBalanced: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  entryCount: number;
  entries: CsvEntryDto[];
  errors: string[];
}

export async function checkBalance(file: File): Promise<BalanceCheckResultDto> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<BalanceCheckResultDto>('/balancechecker/check', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

export async function downloadTemplate(): Promise<void> {
  const response = await api.get('/balancechecker/template', {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'balance_checker_template.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
