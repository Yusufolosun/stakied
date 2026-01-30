import React from 'react';

export const WalletStatus: React.FC<{ connected: boolean }> = ({ connected }) => {
  return (
    <div className="wallet-status">
      <span className={connected ? 'status-connected' : 'status-disconnected'}>
        {connected ? '● Connected' : '○ Disconnected'}
      </span>
    </div>
  );
};
