import { useState, useEffect, useCallback } from 'react'
import { useContract } from './useContract'

export const useSYToken = (address?: string) => {
  const [balance, setBalance] = useState('0')
  const { callFunction, loading } = useContract()

  const fetchBalance = useCallback(async () => {
    if (!address) return
    
    try {
      await callFunction('get-balance', [address])
      // In real implementation, set balance from result
      setBalance('0')
    } catch (err) {
      console.error('Failed to fetch SY balance:', err)
    }
  }, [address, callFunction])

  useEffect(() => {
    if (address) {
      setTimeout(() => {
        void fetchBalance();
      }, 0);
    }
  }, [address, fetchBalance]);

  const deposit = async (amount: number) => {
    return callFunction('deposit', [amount])
  }

  const redeem = async (amount: number) => {
    return callFunction('redeem', [amount])
  }

  return { balance, deposit, redeem, loading, refresh: fetchBalance }
}
