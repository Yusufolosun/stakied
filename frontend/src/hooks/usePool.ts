import { useState, useEffect, useCallback, useContext } from 'react';
import { uintCV, principalCV } from '@stacks/transactions';
import { useTransaction } from './useTransaction';
import { ContractContext } from '../context/ContractContext';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const usePool = (userAddress: string | null) => {
  const [stakedBalance, setStakedBalance] = useState<bigint>(0n);
  const [isFetching, setIsFetching] = useState(false);
  const { stakingPoolAddress } = useContext(ContractContext)!;
  const { execute, isPending, error } = useTransaction();

  const [contractAddress, contractName] = stakingPoolAddress.split('.');

  const fetchStakedBalance = useCallback(async () => {
    if (!userAddress) return;
    setIsFetching(true);

    const network = import.meta.env.VITE_NETWORK === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
    const apiUrl = network.coreApiUrl;

    try {
      // Fetching staked balance from the contract map
      const response = await fetch(
        `${apiUrl}/extended/v1/address/${stakingPoolAddress}/map_fetch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            map_name: 'staker-info',
            key: principalCV(userAddress)
          })
        }
      );
      // Parsing logic would go here in production
      setStakedBalance(0n); // Placeholder for parsed value
    } catch (err) {
      console.error('Failed to fetch staked balance:', err);
    } finally {
      setIsFetching(false);
    }
  }, [userAddress, stakingPoolAddress]);

  useEffect(() => {
    fetchStakedBalance();
  }, [fetchStakedBalance]);

  const stake = async (amount: bigint) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'stake',
      functionArgs: [uintCV(amount)],
    });
    fetchStakedBalance();
  };

  const unstake = async (amount: bigint) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'unstake',
      functionArgs: [uintCV(amount)],
    });
    fetchStakedBalance();
  };

  const claimRewards = async () => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'claim-rewards',
      functionArgs: [],
    });
  };

  return {
    stakedBalance,
    stake,
    unstake,
    claimRewards,
    isLoading: isPending || isFetching,
    error,
    refresh: fetchStakedBalance
  };
};
