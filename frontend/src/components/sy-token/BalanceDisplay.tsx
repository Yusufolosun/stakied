import React from 'react';

export const BalanceDisplay: React.FC<{ balance: number }> = ({ balance }) => {
  return (
    <div className="balance-display">
      <h3>SY Token Balance</h3>
      <p className="balance-amount">{balance.toLocaleString()}</p>
    </div>
  );
};
