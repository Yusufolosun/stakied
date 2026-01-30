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

export interface MintPtYtOptions {
  syAmount: number;
  maturity: number;
  minOutput: number;
  senderKey: string;
  fee?: number;
}

export interface RedeemPtOptions {
  ptAmount: number;
  maturity: number;
  minOutput: number;
  senderKey: string;
  fee?: number;
}
