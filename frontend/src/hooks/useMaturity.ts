import { useState, useEffect } from 'react'

interface MaturityInfo {
  timestamp: number
  isMatured: boolean
  remainingDays: number
}

export const useMaturity = (maturityTimestamp?: number) => {
  const [maturityInfo, setMaturityInfo] = useState<MaturityInfo>({
    timestamp: 0,
    isMatured: false,
    remainingDays: 0
  })

  useEffect(() => {
    if (!maturityTimestamp) return

    const checkMaturity = () => {
      const now = Date.now() / 1000 // Convert to seconds
      const isMatured = now >= maturityTimestamp
      const remainingSeconds = Math.max(0, maturityTimestamp - now)
      const remainingDays = Math.floor(remainingSeconds / 86400)

      setMaturityInfo({
        timestamp: maturityTimestamp,
        isMatured,
        remainingDays
      })
    }

    checkMaturity()
    const interval = setInterval(checkMaturity, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [maturityTimestamp])

  return maturityInfo
}
