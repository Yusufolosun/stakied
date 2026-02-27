import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import type { ClarityValue, PostCondition } from '@stacks/transactions';

interface TransactionOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  postConditions?: PostCondition[];
  onSuccess?: (txId: string) => void;
  onError?: (error: string) => void;
}

export const useTransaction = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const execute = async (options: TransactionOptions) => {
    setIsPending(true);
    setError(null);

    // Default to mainnet, but allow override via VITE_NETWORK env
    const network = import.meta.env.VITE_NETWORK === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;

    try {
      await openContractCall({
        network,
        contractAddress: options.contractAddress,
        contractName: options.contractName,
        functionName: options.functionName,
        functionArgs: options.functionArgs,
        postConditions: options.postConditions,
        onFinish: (data) => {
          setLastTxId(data.txId);
          setIsPending(false);
          if (options.onSuccess) options.onSuccess(data.txId);
        },
        onCancel: () => {
          setIsPending(false);
          setError('User cancelled transaction');
          if (options.onError) options.onError('Cancelled');
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setError(msg);
      setIsPending(false);
      if (options.onError) options.onError(msg);
    }
  };

  return { execute, isPending, error, lastTxId };
};
