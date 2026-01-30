import React from 'react';

export const TransactionHistory: React.FC = () => {
  return (
    <div className="transaction-history">
      <h3>Recent Transactions</h3>
      <ul className="tx-list">
        <li>No transactions yet</li>
      </ul>
    </div>
  );
};
