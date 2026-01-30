import { useState, useEffect } from 'react'
import { useContract } from './useContract'

export const useSYToken = (address?: string) => {
  const [balance, setBalance] = useState('0')
  const [totalSupply, setTotalSupply] = useState('0')
  const { callFunction, loading } = useContract()

  useEffect(() => {
    if (address) {
      fetchBalance()
    }
  }, [address])

  const fetchBalance = async () => {
    if (!address) return
    
    try {
      const result = await callFunction({
        contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
        contractName: 'sy-token',
        functionName: 'get-balance',
        functionArgs: [address]
      })
      setBalance(result)
    } catch (err) {
      console.error('Failed to fetch SY balance:', err)
    }
  }

  const deposit = async (amount: number) => {
    return callFunction({
      contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      contractName: 'sy-token',
      functionName: 'deposit',
      functionArgs: [amount]
    })
  }

  const redeem = async (amount: number) => {
    return callFunction({
      contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      contractName: 'sy-token',
      functionName: 'redeem',
      functionArgs: [amount]
    })
  }

  return { balance, totalSupply, deposit, redeem, loading, refresh: fetchBalance }
}
