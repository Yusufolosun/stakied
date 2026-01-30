export const formatAmount = (amount: number, decimals: number = 6): string => {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
};

export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};
