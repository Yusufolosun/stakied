// Token types
export interface Token {
  symbol: 'STX' | 'SY' | 'PT' | 'YT'
  name: string
  decimals: number
  contractAddress?: string
}

// Balance type
export interface Balance {
  address: string
  tokenType: 'SY' | 'PT' | 'YT'
  amount: string
  formatted: string
}

// Transaction types
export interface Transaction {
  txId: string
  type: 'deposit' | 'redeem' | 'mint' | 'claim' | 'swap' | 'add-liquidity' | 'remove-liquidity'
  amount: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  blockHeight?: number
}

// Position type
export interface Position {
  id: string
  owner: string
  tokenType: 'SY' | 'PT' | 'YT'
  amount: string
  maturity?: number
  createdAt: number
  yield?: string
}

// Pool type
export interface Pool {
  id: string
  ptReserve: string
  syReserve: string
  totalLiquidity: string
  apy: string
  volume24h: string
  fees24h: string
}

// Wallet state type
export interface WalletState {
  address: string | null
  connected: boolean
  balance: string
  network: 'mainnet' | 'testnet'
}

// Contract call options
export interface ContractCallOptions {
  contractAddress: string
  contractName: string
  functionName: string
  functionArgs: any[]
}

// Error type
export interface StakiedError {
  code: string
  message: string
  details?: any
}

// Yield info type
export interface YieldInfo {
  accumulatedYield: string
  currentAPY: string
  projectedYield: string
  lastUpdate: number
}

// Maturity info type
export interface MaturityInfo {
  timestamp: number
  isMatured: boolean
  remainingDays: number
  formattedDate: string
}
