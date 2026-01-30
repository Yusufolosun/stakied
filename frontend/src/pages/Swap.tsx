import React, { useState } from 'react'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

export const Swap: React.FC = () => {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  
  return (
    <div className="swap-page">
      <h1>Swap Tokens</h1>
      
      <Card>
        <h2>Swap PT ↔ SY</h2>
        <div className="swap-form">
          <div className="swap-input">
            <label>From</label>
            <Input 
              placeholder="0.0" 
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <select>
              <option>PT</option>
              <option>SY</option>
            </select>
          </div>
          
          <div className="swap-arrow">↓</div>
          
          <div className="swap-input">
            <label>To</label>
            <Input 
              placeholder="0.0" 
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              disabled 
            />
            <select>
              <option>SY</option>
              <option>PT</option>
            </select>
          </div>

          <div className="swap-info">
            <div>
              <span>Exchange Rate:</span>
              <span>1 PT = 1.0 SY</span>
            </div>
            <div>
              <span>Price Impact:</span>
              <span>0.1%</span>
            </div>
          </div>

          <Button>Swap</Button>
        </div>
      </Card>
    </div>
  )
}
