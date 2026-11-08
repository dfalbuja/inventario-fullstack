export type TransactionType = 'Purchase' | 'Sale';

export const TRANSACTION_TYPES: TransactionType[] = ['Purchase', 'Sale'];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  Purchase: 'Compra',
  Sale: 'Venta',
};

export interface Transaction {
  id: number;
  transactionDate: string;
  type: TransactionType;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  detail: string | null;
}

export type CreateTransactionRequest = Omit<Transaction, 'id' | 'totalPrice'>;

export type TransactionRequest = Omit<CreateTransactionRequest, 'productId'>;

export type TransactionFilters = {
  productId?: number | null;
  type?: TransactionType | null;
  dateFrom?: string | null;
  dateTo?: string | null;
};
