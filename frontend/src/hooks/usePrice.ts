import { useState, useEffect } from 'react'

interface PriceData {
  current: number
  high24h: number
  low24h: number
  change24h: number
  changePercent24h: number
}

export const usePrice = (tokenPair: string) => {
  const [priceData, setPriceData] = useState<PriceData>({
    current: 1.0,
    high24h: 1.05,
    low24h: 0.95,
    change24h: 0.02,
    changePercent24h: 2.0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [tokenPair])

  const fetchPrice = async () => {
    setLoading(true)
    try {
      // Fetch price data
      // Placeholder
    } catch (error) {
      console.error('Failed to fetch price:', error)
    } finally {
      setLoading(false)
    }
  }

  return { priceData, loading, refresh: fetchPrice }
}
