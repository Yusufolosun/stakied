import { useState } from 'react'
import { openContractCall } from '@stacks/connect'
import { StacksMainnet } from '@stacks/network'
import { uintCV, principalCV } from '@stacks/transactions'

interface TransactionOptions {
  contractAddress: string
  contractName: string
  functionName: string
  functionArgs: any[]
}

export const useTransaction = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)

  const executeTransaction = async (options: TransactionOptions) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await openContractCall({
        network: new StacksMainnet(),
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
