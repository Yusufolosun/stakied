import { useState, useEffect, useCallback, useContext } from 'react';
import { uintCV, principalCV } from '@stacks/transactions';
import { useTransaction } from './useTransaction';
import { ContractContext } from '../context/ContractContext';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const useSYToken = (userAddress: string | null) => {
  const [balance, setBalance] = useState<bigint>(0n);
  const [isFetching, setIsFetching] = useState(false);
  const { syTokenAddress } = useContext(ContractContext)!;
  const { execute, isPending, error } = useTransaction();

  const [contractAddress, contractName] = syTokenAddress.split('.');

  const fetchBalance = useCallback(async () => {
    if (!userAddress) return;
    setIsFetching(true);

    const network = import.meta.env.VITE_NETWORK === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
    const apiUrl = network.coreApiUrl;

    try {
      const response = await fetch(
        `${apiUrl}/extended/v1/address/${syTokenAddress}/map_fetch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            map_name: 'balances',
            key: principalCV(userAddress)
          })
        }
      );
      // Simplified: In production we'd parse the Clarity value response correctly
      // For now, let's assume we can fetch it via the API's balance endpoint for FTs
      const ftResponse = await fetch(`${apiUrl}/extended/v1/address/${userAddress}/balances`);
      const ftData = await ftResponse.json();
      const syBalance = ftData.fungible_tokens[syTokenAddress]?.balance || '0';
      setBalance(BigInt(syBalance));
    } catch (err) {
      console.error('Failed to fetch SY balance:', err);
    } finally {
      setIsFetching(false);
    }
  }, [userAddress, syTokenAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const deposit = async (amount: bigint) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'deposit',
      functionArgs: [uintCV(amount)],
    });
    fetchBalance();
  };

  const redeem = async (amount: bigint) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'redeem',
      functionArgs: [uintCV(amount)],
    });
    fetchBalance();
  };

  return {
    balance,
    deposit,
    redeem,
    isLoading: isPending || isFetching,
    error,
    refresh: fetchBalance
  };
};
