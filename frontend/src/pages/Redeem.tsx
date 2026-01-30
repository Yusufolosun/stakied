import React from 'react';
import { RedeemPTForm } from '../components/pt-yt/RedeemPTForm';

export const Redeem: React.FC = () => {
  return (
    <div className="redeem-page">
      <h1>Redeem PT Tokens</h1>
      <RedeemPTForm />
    </div>
  );
};
