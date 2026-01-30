/**
 * Get block explorer URL for transaction
 */
export const getExplorerTxUrl = (txId: string, network: 'mainnet' | 'testnet' = 'mainnet'): string => {
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.stacks.co/txid'
    : 'https://explorer.hiro.so/txid'
  return `${baseUrl}/${txId}?chain=${network}`
}

/**
 * Get block explorer URL for address
 */
export const getExplorerAddressUrl = (address: string, network: 'mainnet' | 'testnet' = 'mainnet'): string => {
  const baseUrl = network === 'mainnet'
    ? 'https://explorer.stacks.co/address'
    : 'https://explorer.hiro.so/address'
  return `${baseUrl}/${address}?chain=${network}`
}

/**
 * Get block explorer URL for contract
 */
export const getExplorerContractUrl = (address: string, contractName: string, network: 'mainnet' | 'testnet' = 'mainnet'): string => {
  const baseUrl = network === 'mainnet'
    ? 'https://explorer.stacks.co/txid'
    : 'https://explorer.hiro.so/txid'
  return `${baseUrl}/${address}.${contractName}?chain=${network}`
}

/**
 * Truncate hash for display
 */
export const truncateHash = (hash: string, startChars: number = 6, endChars: number = 4): string => {
  if (hash.length <= startChars + endChars) return hash
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`
}
