import React, { useState } from 'react'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Button } from '../common/Button'

type SwapDirection = 'pt-to-sy' | 'sy-to-pt'

export const SwapForm: React.FC = () => {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [direction, setDirection] = useState<SwapDirection>('pt-to-sy')
  const [loading, setLoading] = useState(false)

  const handleSwap = () => {
    setDirection(direction === 'pt-to-sy' ? 'sy-to-pt' : 'pt-to-sy')
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      console.log('Swapping:', { fromAmount, toAmount, direction })
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3>Swap Tokens</h3>
      <form onSubmit={handleSubmit}>
        <div className="swap-container">
          <div className="swap-input-wrapper">
            <Input
              label={`From (${direction === 'pt-to-sy' ? 'PT' : 'SY'})`}
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
            />
          </div>
          
          <button
            type="button"
            className="swap-button"
            onClick={handleSwap}
          >
            ↕️ Swap
          </button>
          
          <div className="swap-input-wrapper">
            <Input
              label={`To (${direction === 'pt-to-sy' ? 'SY' : 'PT'})`}
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              placeholder="0.0"
              disabled
            />
          </div>
        </div>
        
        <div className="swap-details">
          <div>
            <span>Exchange Rate:</span>
            <span>1 PT = 1.0 SY</span>
          </div>
          <div>
            <span>Price Impact:</span>
            <span className="text-warning">0.1%</span>
          </div>
          <div>
            <span>Minimum Received:</span>
            <span>{toAmount || '0'}</span>
          </div>
        </div>
        
        <Button type="submit" disabled={loading || !fromAmount}>
          {loading ? 'Swapping...' : 'Swap'}
        </Button>
      </form>
    </Card>
  )
}
