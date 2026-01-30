import { useState } from 'react'
import { openContractCall } from '@stacks/connect'
import { STACKS_MAINNET } from '@stacks/network'
import type { ClarityValue } from '@stacks/transactions'

interface TransactionOptions {
  contractAddress: string
  contractName: string
  functionName: string
  functionArgs: ClarityValue[]
}

export const useTransaction = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)

  const executeTransaction = async (options: TransactionOptions) => {
    setLoading(true)
    setError(null)
    
    try {
      await openContractCall({
        network: STACKS_MAINNET,
        contractAddress: options.contractAddress,
        contractName: options.contractName,
        functionName: options.functionName,
        functionArgs: options.functionArgs,
        onFinish: (data) => {
          setTxId(data.txId)
          setLoading(false)
        },
        onCancel: () => {
          setLoading(false)
          setError('Transaction cancelled')
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setLoading(false)
    }
  }

  return { executeTransaction, loading, error, txId }
}
