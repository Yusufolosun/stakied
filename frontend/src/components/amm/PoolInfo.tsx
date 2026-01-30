import React from 'react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'

interface PoolInfo {
  ptReserve: string
  syReserve: string
  totalLiquidity: string
  yourShare: string
  apy: string
}

export const PoolInfo: React.FC = () => {
  const poolInfo: PoolInfo = {
    ptReserve: '0',
    syReserve: '0',
    totalLiquidity: '0',
    yourShare: '0%',
    apy: '5.00%'
  }

  return (
    <Card>
      <div className="pool-info-header">
        <h3>Pool Information</h3>
        <Badge variant="success">Active</Badge>
      </div>
      
      <div className="pool-info-grid">
        <div className="info-item">
          <span className="label">PT Reserve</span>
          <span className="value">{poolInfo.ptReserve}</span>
        </div>
        
        <div className="info-item">
          <span className="label">SY Reserve</span>
          <span className="value">{poolInfo.syReserve}</span>
        </div>
        
        <div className="info-item">
          <span className="label">Total Liquidity</span>
          <span className="value">{poolInfo.totalLiquidity}</span>
        </div>
        
        <div className="info-item">
          <span className="label">Your Share</span>
          <span className="value">{poolInfo.yourShare}</span>
        </div>
        
        <div className="info-item">
          <span className="label">APY</span>
          <span className="value highlight">{poolInfo.apy}</span>
        </div>
      </div>
    </Card>
  )
}
