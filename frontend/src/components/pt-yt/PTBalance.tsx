import React from 'react';

export const PTBalance: React.FC<{ balance: number; maturity: number }> = ({ balance, maturity }) => {
  return (
    <div className="pt-balance">
      <h3>PT Token Balance</h3>
      <p>{balance.toLocaleString()}</p>
      <small>Maturity: {new Date(maturity * 1000).toLocaleDateString()}</small>
    </div>
  );
};
