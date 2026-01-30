import React, { useState } from 'react';

export const DepositForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  
  return (
    <form className="deposit-form">
      <h2>Deposit SY</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
    </form>
  );
};
