import React from 'react'
import { Card } from '../common/Card'

interface PoolStat {
  label: string
  value: string
  change?: string
}

export const PoolStats: React.FC = () => {
  const stats: PoolStat[] = [
    { label: 'Total Value Locked', value: '$0.00', change: '+0%' },
    { label: 'Total SY Deposited', value: '0 STX', change: '+0%' },
    { label: 'Active Positions', value: '0', change: '+0%' },
    { label: 'Total Yield Generated', value: '0 STX', change: '+0%' }
  ]

  return (
    <div className="pool-stats">
      <h2>Pool Statistics</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="stat-item">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              {stat.change && <span className="stat-change">{stat.change}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
