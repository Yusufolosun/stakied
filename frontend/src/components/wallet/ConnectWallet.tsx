import React, { useState } from 'react';
import { showConnect } from '@stacks/connect';

export const ConnectWallet: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = () => {
    setIsConnecting(true);
    showConnect({
      appDetails: {
        name: 'Stakied Protocol',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: () => {
        setIsConnecting(false);
        console.log('Wallet connected');
      },
      onCancel: () => {
        setIsConnecting(false);
      },
    });
  };
  
  return (
    <button 
      className="connect-btn" 
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};
