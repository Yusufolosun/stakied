import React, { useState } from 'react'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Button } from '../common/Button'

interface RemoveLiquidityFormProps {
  onSuccess?: () => void
}

export const RemoveLiquidityForm: React.FC<RemoveLiquidityFormProps> = ({ onSuccess }) => {
  const [percentage, setPercentage] = useState('100')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Remove liquidity logic here
      console.log('Removing liquidity:', percentage)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to remove liquidity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3>Remove Liquidity</h3>
      <form onSubmit={handleSubmit}>
        <Input
          label="Percentage to Remove"
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
        />
        <div className="percentage-display">{percentage}%</div>
        
        <div className="removal-info">
          <div>
            <span>You will receive (PT):</span>
            <span>0</span>
          </div>
          <div>
            <span>You will receive (SY):</span>
            <span>0</span>
          </div>
        </div>
        
        <Button type="submit" variant="danger" disabled={loading}>
          {loading ? 'Removing...' : 'Remove Liquidity'}
        </Button>
      </form>
    </Card>
  )
}
