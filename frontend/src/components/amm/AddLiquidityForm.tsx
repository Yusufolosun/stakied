import React, { useState } from 'react'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Button } from '../common/Button'

interface AddLiquidityFormProps {
  onSuccess?: () => void
}

export const AddLiquidityForm: React.FC<AddLiquidityFormProps> = ({ onSuccess }) => {
  const [ptAmount, setPtAmount] = useState('')
  const [syAmount, setSyAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Add liquidity logic here
      console.log('Adding liquidity:', { ptAmount, syAmount })
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add liquidity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3>Add Liquidity</h3>
      <form onSubmit={handleSubmit}>
        <Input
          label="PT Amount"
          value={ptAmount}
          onChange={(e) => setPtAmount(e.target.value)}
          placeholder="0.0"
        />
        <Input
          label="SY Amount"
          value={syAmount}
          onChange={(e) => setSyAmount(e.target.value)}
          placeholder="0.0"
        />
        <div className="liquidity-info">
          <div>
            <span>Share of Pool:</span>
            <span>0%</span>
          </div>
          <div>
            <span>Exchange Rate:</span>
            <span>1 PT = 1.0 SY</span>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Liquidity'}
        </Button>
      </form>
    </Card>
  )
}
