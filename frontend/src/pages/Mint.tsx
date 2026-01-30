import React from 'react';
import { MintForm } from '../components/pt-yt/MintForm';
import { PTBalance } from '../components/pt-yt/PTBalance';
import { YTBalance } from '../components/pt-yt/YTBalance';

export const Mint: React.FC = () => {
  return (
    <div className="mint-page">
      <h1>Mint PT/YT Tokens</h1>
      <div className="balances">
        <PTBalance balance={0} maturity={0} />
        <YTBalance balance={0} maturity={0} />
      </div>
      <MintForm />
    </div>
  );
};
