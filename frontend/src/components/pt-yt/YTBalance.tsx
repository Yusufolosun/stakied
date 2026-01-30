import React from 'react';

export const YTBalance: React.FC<{ balance: number; maturity: number }> = ({ balance, maturity }) => {
  return (
    <div className="yt-balance">
      <h3>YT Token Balance</h3>
      <p>{balance.toLocaleString()}</p>
      <small>Maturity: {new Date(maturity * 1000).toLocaleDateString()}</small>
    </div>
  );
};
