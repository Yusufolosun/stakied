export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateAddress = (address: string): boolean => {
  return address.startsWith('SP') || address.startsWith('ST');
};

export const validateMaturity = (maturity: number): boolean => {
  return maturity > Math.floor(Date.now() / 1000);
};
