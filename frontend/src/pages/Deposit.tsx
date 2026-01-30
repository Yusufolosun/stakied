import React from 'react';
import { DepositForm } from '../components/sy-token/DepositForm';
import { BalanceDisplay } from '../components/sy-token/BalanceDisplay';

export const Deposit: React.FC = () => {
  return (
    <div className="deposit-page">
      <h1>Deposit Assets</h1>
      <BalanceDisplay balance={0} />
      <DepositForm />
    </div>
  );
};
