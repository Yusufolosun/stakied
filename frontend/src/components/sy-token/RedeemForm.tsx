import React, { useState } from 'react';

export const RedeemForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  
  return (
    <form className="redeem-form">
      <h2>Redeem SY</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to redeem"
      />
      <button type="submit">Redeem</button>
    </form>
  );
};
