import { useState, useEffect, useCallback, useContext } from 'react';
import { uintCV } from '@stacks/transactions';
import { useTransaction } from './useTransaction';
import { ContractContext } from '../context/ContractContext';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const usePTYT = (userAddress: string | null) => {
  const [ptBalance, setPtBalance] = useState<bigint>(0n);
  const [ytBalance, setYtBalance] = useState<bigint>(0n);
  const [isFetching, setIsFetching] = useState(false);
  const { ptYtCoreAddress } = useContext(ContractContext)!;
  const { execute, isPending, error } = useTransaction();

  const [contractAddress, contractName] = ptYtCoreAddress.split('.');

  const fetchBalances = useCallback(async () => {
    if (!userAddress) return;
    setIsFetching(true);

    const network = import.meta.env.VITE_NETWORK === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
    const apiUrl = network.coreApiUrl;

    try {
      // In a real production environment, we would use a specialized indexer or 
      // aggregate these calls. For this implementation, we fetch via standard balance API.
      const response = await fetch(`${apiUrl}/extended/v1/address/${userAddress}/balances`);
      const data = await response.json();

      // PT and YT are fungible tokens defined in the core contract
      // We'd typically need the full asset identifier: contract-address.contract-name::asset-name
      const ptAssetId = `${ptYtCoreAddress}::principal-token`;
      const ytAssetId = `${ptYtCoreAddress}::yield-token`;

      setPtBalance(BigInt(data.fungible_tokens[ptAssetId]?.balance || '0'));
      setYtBalance(BigInt(data.fungible_tokens[ytAssetId]?.balance || '0'));
    } catch (err) {
      console.error('Failed to fetch PT/YT balances:', err);
    } finally {
      setIsFetching(false);
    }
  }, [userAddress, ptYtCoreAddress]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const mintPTYT = async (syAmount: bigint, maturity: number) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'mint-pt-yt',
      functionArgs: [uintCV(syAmount), uintCV(maturity)],
    });
    fetchBalances();
  };

  const redeemPT = async (ptAmount: bigint, maturity: number) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'redeem-pt',
      functionArgs: [uintCV(ptAmount), uintCV(maturity)],
    });
    fetchBalances();
  };

  const claimYield = async (maturity: number) => {
    await execute({
      contractAddress,
      contractName,
      functionName: 'claim-yield',
      functionArgs: [uintCV(maturity)],
    });
    fetchBalances();
  };

  return {
    ptBalance,
    ytBalance,
    mintPTYT,
    redeemPT,
    claimYield,
    isLoading: isPending || isFetching,
    error,
    refresh: fetchBalances
  };
};
