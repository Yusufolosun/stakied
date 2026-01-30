import { useState, useCallback } from 'react';

export const useContract = (contractAddress: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callFunction = useCallback(async (functionName: string, args: any[]) => {
    setLoading(true);
    try {
      // Contract call logic
      console.log('Calling', functionName, 'with', args);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [contractAddress]);

  return { loading, error, callFunction };
};
