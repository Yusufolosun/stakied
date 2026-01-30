import { useState, useEffect } from 'react'
import { useContract } from './useContract'

interface YieldInfo {
  accumulatedYield: string
  currentAPY: string
  projectedYield: string
}

export const useYield = (ytBalance?: string, maturity?: number) => {
  const [yieldInfo, setYieldInfo] = useState<YieldInfo>({
    accumulatedYield: '0',
    currentAPY: '0',
    projectedYield: '0'
  })
  const { callFunction } = useContract()

  useEffect(() => {
    if (ytBalance && maturity) {
      calculateYield()
    }
  }, [ytBalance, maturity])

  const calculateYield = async () => {
    try {
      // Placeholder calculation - should call actual contract
      const balance = parseFloat(ytBalance || '0')
      const apy = 5 // 5% placeholder APY
      const accumulated = (balance * apy) / 100
      
      setYieldInfo({
        accumulatedYield: accumulated.toFixed(2),
        currentAPY: apy.toFixed(2),
        projectedYield: (accumulated * 1.1).toFixed(2)
      })
    } catch (err) {
      console.error('Failed to calculate yield:', err)
    }
  }

  return { ...yieldInfo, refresh: calculateYield }
}
