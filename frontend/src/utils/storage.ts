/**
 * Store data in localStorage
 */
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Get data from localStorage
 */
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

/**
 * Remove data from localStorage
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

/**
 * Clear all localStorage
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'stakied_wallet_address',
  NETWORK: 'stakied_network',
  THEME: 'stakied_theme',
  TRANSACTIONS: 'stakied_transactions',
  POSITIONS: 'stakied_positions'
}
