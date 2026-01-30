import React from 'react'
import { Card } from '../common/Card'

interface Position {
  id: string
  type: 'SY' | 'PT' | 'YT'
  amount: string
  maturity?: number
  yield: string
}

export const UserPositions: React.FC = () => {
  const positions: Position[] = []

  return (
    <Card>
      <h3>My Positions</h3>
      {positions.length === 0 ? (
        <p>No positions yet. Start by depositing to SY token.</p>
      ) : (
        <table className="positions-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Maturity</th>
              <th>Yield</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id}>
                <td>{position.type}</td>
                <td>{position.amount}</td>
                <td>{position.maturity || 'N/A'}</td>
                <td>{position.yield}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}
