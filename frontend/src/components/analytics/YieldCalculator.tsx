import React, { useState } from 'react'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Button } from '../common/Button'

export const YieldCalculator: React.FC = () => {
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [estimatedYield, setEstimatedYield] = useState('0')

  const calculateYield = () => {
    // Simple yield calculation placeholder
    const principal = parseFloat(amount) || 0
    const days = parseFloat(duration) || 0
    const apy = 5 // 5% APY placeholder
    const yield_ = (principal * apy * days) / (365 * 100)
    setEstimatedYield(yield_.toFixed(2))
  }

  return (
    <Card>
      <h3>Yield Calculator</h3>
      <div className="calculator-form">
        <Input
          label="Amount (STX)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
        />
        <Input
          label="Duration (days)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="365"
        />
        <Button onClick={calculateYield}>Calculate</Button>
        <div className="result">
          <strong>Estimated Yield:</strong> {estimatedYield} STX
        </div>
      </div>
    </Card>
  )
}
