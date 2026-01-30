import React from 'react';

export const ClaimYieldForm: React.FC<{ maturity: number }> = ({ maturity }) => {
  return (
    <form className="claim-yield-form">
      <h2>Claim Yield</h2>
      <p>Maturity: {new Date(maturity * 1000).toLocaleDateString()}</p>
      <button type="submit">Claim Yield</button>
    </form>
  );
};
