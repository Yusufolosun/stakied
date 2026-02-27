import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { AppConfig, UserSession, showConnect, type UserData } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';

interface WalletContextType {
  address: string | null;
  userData: UserData | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setUserData(data);
      setAddress(data.profile.stxAddress.mainnet);
    }
  }, []);

  const connect = () => {
    showConnect({
      appDetails: {
        name: 'Stakied Protocol',
        icon: window.location.origin + '/logo.png',
      },
      userSession,
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
        setAddress(data.profile.stxAddress.mainnet);
      },
      onCancel: () => {
        console.log('User cancelled connection');
      },
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setUserData(null);
    setAddress(null);
  };

  const connected = !!userData;

  return (
    <WalletContext.Provider value={{ address, userData, connected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext };
