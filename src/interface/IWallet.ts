export interface WalletTransaction {
  _id: string;
  amount: number;
  order_id: string;
  timestamp: string;
  verified: boolean | string;
}

export interface FormattedTransaction {
  date: string;
  orderId: string;
  amount: string;
  status: string;
}