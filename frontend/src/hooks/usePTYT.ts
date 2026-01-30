import { useState, useEffect, useCallback } from 'react'
import { useContract } from './useContract'

export const usePTYT = (address?: string) => {
  const [ptBalance, setPtBalance] = useState('0')
  const [ytBalance, setYtBalance] = useState('0')
  const { callFunction, loading } = useContract()

  const fetchBalances = useCallback(async () => {
    if (!address) return
    
    try {
      await callFunction('get-pt-balance', [address])
      setPtBalance('0') // Set from result in real implementation

      await callFunction('get-yt-balance', [address])
      setYtBalance('0') // Set from result in real implementation
    } catch (err) {
      console.error('Failed to fetch PT/YT balances:', err)
    }
  }, [address, callFunction])

  useEffect(() => {
    if (address) {
      setTimeout(() => {
        void fetchBalances();
      }, 0);
    }
  }, [address, fetchBalances]);

  const mintPTYT = async (syAmount: number, maturity: number) => {
    return callFunction('mint-pt-yt', [syAmount, maturity])
  }

  const redeemPT = async (ptAmount: number, maturity: number) => {
    return callFunction('redeem-pt', [ptAmount, maturity])
  }

  const claimYield = async (ytAmount: number, maturity: number) => {
    return callFunction('claim-yield', [ytAmount, maturity])
  }

  return { 
    ptBalance, 
    ytBalance, 
    mintPTYT, 
    redeemPT, 
    claimYield, 
    loading, 
    refresh: fetchBalances 
  }
}
