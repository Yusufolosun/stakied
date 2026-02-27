import { useState, useEffect, useCallback } from 'react';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const useSTXBalance = (address: string | null) => {
    const [balance, setBalance] = useState<bigint>(0n);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!address) return;

        setIsLoading(true);
        setError(null);

        const network = import.meta.env.VITE_NETWORK === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
        const apiUrl = network.coreApiUrl;

        try {
            const response = await fetch(`${apiUrl}/extended/v1/address/${address}/balances`);
            const data = await response.json();

            if (data && data.stx) {
                setBalance(BigInt(data.stx.balance));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch balance');
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchBalance();

        // Refresh balance every 30 seconds
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    return { balance, isLoading, error, refresh: fetchBalance };
};
