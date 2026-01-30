export function validateMaturity(maturity: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return maturity > now;
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && Number.isInteger(amount);
}
