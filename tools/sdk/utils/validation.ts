export function validateMaturity(maturity: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return maturity > now;
}
