import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <WalletContext.Provider value={{ address, connected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
};
