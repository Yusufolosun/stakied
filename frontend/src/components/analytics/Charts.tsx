import React from 'react'
import { Card } from '../common/Card'

export const Charts: React.FC = () => {
  return (
    <div className="charts-container">
      <Card>
        <h3>TVL Over Time</h3>
        <div className="chart-placeholder">
          <p>Chart visualization will be implemented here</p>
        </div>
      </Card>
      <Card>
        <h3>Yield Distribution</h3>
        <div className="chart-placeholder">
          <p>Chart visualization will be implemented here</p>
        </div>
      </Card>
    </div>
  )
}
