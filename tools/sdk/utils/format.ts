export function formatAmount(amount: number, decimals: number = 6): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}

export function parseAmount(amount: string, decimals: number = 6): number {
  return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}
