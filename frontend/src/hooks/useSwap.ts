import { useState, useEffect, useCallback, useContext } from 'react';
import { uintCV, principalCV } from '@stacks/transactions';
import { useTransaction } from './useTransaction';
import { ContractContext } from '../context/ContractContext';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const useSwap = (userAddress: string | null) => {
  const [isFetching, setIsFetching] = useState(false);
  const { ptYtAmmAddress } = useContext(ContractContext)!;
  const { execute, isPending, error } = useTransaction();

  const [contractAddress, contractName] = ptYtAmmAddress.split('.');

  const buyPT = async (syAmount: bigint, minPtAmount: bigint) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'buy-pt',
      functionArgs: [uintCV(syAmount), uintCV(minPtAmount)],
    });
  };

  const sellPT = async (ptAmount: bigint, minSyAmount: bigint) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'sell-pt',
      functionArgs: [uintCV(ptAmount), uintCV(minSyAmount)],
    });
  };

  const swapSYforPT = async (syAmount: bigint, minPtAmount: bigint) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'swap-sy-for-pt',
      functionArgs: [uintCV(syAmount), uintCV(minPtAmount)],
    });
  };

  return {
    buyPT,
    sellPT,
    swapSYforPT,
    isLoading: isPending || isFetching,
    error
  };
};
