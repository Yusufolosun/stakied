import { useState, useEffect } from 'react';

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    // Wallet connection logic
    setConnected(true);
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
  };

  return { address, connected, connect, disconnect };
};
