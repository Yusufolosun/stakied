import React from 'react';

interface WalletInfoProps {
  address: string;
  balance: number;
}

export const WalletInfo: React.FC<WalletInfoProps> = ({ address, balance }) => {
  return (
    <div className="wallet-info">
      <p>Address: {address}</p>
      <p>Balance: {balance} STX</p>
    </div>
  );
};
