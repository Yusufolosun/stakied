import React, { useState } from 'react';

export const RedeemPTForm: React.FC = () => {
  const [ptAmount, setPtAmount] = useState('');
  
  return (
    <form className="redeem-pt-form">
      <h2>Redeem PT</h2>
      <input
        type="number"
        value={ptAmount}
        onChange={(e) => setPtAmount(e.target.value)}
        placeholder="PT Amount"
      />
      <button type="submit">Redeem PT</button>
    </form>
  );
};
