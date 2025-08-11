export interface DepositCallbackDto {
  id: number;
  type: 'deposit' | string;
  crypto_address: {
    id: number;
    currency: string;
    address: string;
    foreign_id: string;
    tag: string | null;
  };
  currency_sent: {
    currency: string;
    amount: string;
  };
  currency_received: {
    currency: string;
    amount: string;
    amount_minus_fee: string;
  };
  transactions: Array<{
    id: number;
    currency: string;
    transaction_type: 'blockchain' | string;
    type: 'deposit' | string;
    address: string;
    tag: string | null;
    amount: string;
    txid: string;
    riskscore: string;
    confirmations: number;
  }>;
  fees: Array<{
    type: string;
    currency: string;
    amount: string;
  }>;
  error: string;
  status: 'pending' | 'confirmed' | 'failed' | string;
}
