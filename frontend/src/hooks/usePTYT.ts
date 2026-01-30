import { useState, useEffect } from 'react'
import { useContract } from './useContract'

export const usePTYT = (address?: string) => {
  const [ptBalance, setPtBalance] = useState('0')
  const [ytBalance, setYtBalance] = useState('0')
  const { callFunction, loading } = useContract()

  useEffect(() => {
    if (address) {
      fetchBalances()
    }
  }, [address])

  const fetchBalances = async () => {
    if (!address) return
    
    try {
      const ptResult = await callFunction({
        contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
        contractName: 'pt-yt-core',
        functionName: 'get-pt-balance',
        functionArgs: [address]
      })
      setPtBalance(ptResult)

      const ytResult = await callFunction({
        contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
        contractName: 'pt-yt-core',
        functionName: 'get-yt-balance',
        functionArgs: [address]
      })
      setYtBalance(ytResult)
    } catch (err) {
      console.error('Failed to fetch PT/YT balances:', err)
    }
  }

  const mintPTYT = async (syAmount: number, maturity: number) => {
    return callFunction({
      contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      contractName: 'pt-yt-core',
      functionName: 'mint-pt-yt',
      functionArgs: [syAmount, maturity]
    })
  }

  const redeemPT = async (ptAmount: number, maturity: number) => {
    return callFunction({
      contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      contractName: 'pt-yt-core',
      functionName: 'redeem-pt',
      functionArgs: [ptAmount, maturity]
    })
  }

  const claimYield = async (ytAmount: number, maturity: number) => {
    return callFunction({
      contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      contractName: 'pt-yt-core',
      functionName: 'claim-yield',
      functionArgs: [ytAmount, maturity]
    })
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
