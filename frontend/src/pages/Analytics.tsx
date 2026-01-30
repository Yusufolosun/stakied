import React from 'react'
import { PoolStats } from '../components/analytics/PoolStats'
import { UserPositions } from '../components/analytics/UserPositions'
import { YieldCalculator } from '../components/analytics/YieldCalculator'
import { Charts } from '../components/analytics/Charts'

export const Analytics: React.FC = () => {
  return (
    <div className="analytics-page">
      <h1>Analytics</h1>
      <PoolStats />
      <div className="analytics-grid">
        <YieldCalculator />
        <UserPositions />
      </div>
      <Charts />
    </div>
  )
}
