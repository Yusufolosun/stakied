import React, { useState } from 'react';

export const MintForm: React.FC = () => {
  const [syAmount, setSyAmount] = useState('');
  const [maturity, setMaturity] = useState('');
  
  return (
    <form className="mint-form">
      <h2>Mint PT/YT</h2>
      <input
        type="number"
        value={syAmount}
        onChange={(e) => setSyAmount(e.target.value)}
        placeholder="SY Amount"
      />
      <input
        type="date"
        value={maturity}
        onChange={(e) => setMaturity(e.target.value)}
        placeholder="Maturity Date"
      />
      <button type="submit">Mint</button>
    </form>
  );
};
