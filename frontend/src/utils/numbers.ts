/**
 * Convert microunits to standard units (e.g., micro-STX to STX)
 */
export const fromMicroUnits = (amount: number | string, decimals: number = 6): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return (value / Math.pow(10, decimals)).toFixed(decimals)
}

/**
 * Convert standard units to microunits (e.g., STX to micro-STX)
 */
export const toMicroUnits = (amount: number | string, decimals: number = 6): number => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return Math.floor(value * Math.pow(10, decimals))
}

/**
 * Format percentage value
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`
}

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`
  }
  return value.toFixed(2)
}
