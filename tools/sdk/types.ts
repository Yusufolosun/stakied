export interface DepositOptions {
  amount: number;
  senderKey: string;
  fee?: number;
}

export interface RedeemOptions {
  amount: number;
  minOutput: number;
  senderKey: string;
  fee?: number;
}
