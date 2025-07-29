export interface WithdrawalCallbackDto {
  id: number;
  type: 'withdrawal' | string;
  request_id?: string;
  currency: string;
  amount_from: string;
  amount_to?: string;
  address: string;
  tag?: string | null;
  status: 'processing' | 'confirmed' | 'failed' | string;
  transactions?: Array<{
    id: number;
    currency: string;
    transaction_type: 'blockchain' | string;
    type: 'withdrawal' | string;
    address: string;
    tag: string | null;
    amount: string;
    txid: string;
    confirmations: number;
  }>;
  fees?: Array<{
    type: string;
    currency: string;
    amount: string;
  }>;
  error?: string;
}
