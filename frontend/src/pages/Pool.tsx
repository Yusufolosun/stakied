import React from 'react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'

export const Pool: React.FC = () => {
  return (
    <div className="pool-page">
      <h1>Liquidity Pool</h1>
      
      <Card>
        <h2>Add Liquidity</h2>
        <p>Provide PT and SY tokens to earn trading fees.</p>
        <Button>Add Liquidity</Button>
      </Card>

      <Card>
        <h2>Remove Liquidity</h2>
        <p>Withdraw your liquidity and claim fees.</p>
        <Button variant="secondary">Remove Liquidity</Button>
      </Card>

      <Card>
        <h2>Pool Information</h2>
        <div className="pool-info">
          <div>
            <strong>Total PT:</strong> 0
          </div>
          <div>
            <strong>Total SY:</strong> 0
          </div>
          <div>
            <strong>Your Share:</strong> 0%
          </div>
        </div>
      </Card>
    </div>
  )
}
