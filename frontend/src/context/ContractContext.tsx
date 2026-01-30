import React, { createContext, useContext, ReactNode } from 'react';

interface ContractContextType {
  syTokenAddress: string;
  ptYtCoreAddress: string;
  ptYtAmmAddress: string;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const ContractProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const syTokenAddress = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.sy-token';
  const ptYtCoreAddress = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.pt-yt-core';
  const ptYtAmmAddress = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.pt-yt-amm';

  return (
    <ContractContext.Provider value={{ syTokenAddress, ptYtCoreAddress, ptYtAmmAddress }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContractContext must be used within ContractProvider');
  }
  return context;
};
