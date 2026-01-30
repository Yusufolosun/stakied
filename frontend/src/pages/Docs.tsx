import React from 'react'
import { Card } from '../components/common/Card'

export const Docs: React.FC = () => {
  return (
    <div className="docs-page">
      <h1>Documentation</h1>
      
      <Card>
        <h2>Getting Started</h2>
        <p>Stakied Protocol enables yield trading on the Stacks blockchain.</p>
        <ol>
          <li>Connect your Stacks wallet</li>
          <li>Deposit STX to mint SY tokens</li>
          <li>Split SY into PT and YT tokens</li>
          <li>Trade or hold to maturity</li>
        </ol>
      </Card>

      <Card>
        <h2>SY Token</h2>
        <p>Standardized Yield (SY) tokens represent your deposited assets earning yield.</p>
        <h3>Functions:</h3>
        <ul>
          <li><code>deposit</code>: Deposit STX to receive SY tokens</li>
          <li><code>redeem</code>: Burn SY tokens to withdraw your STX</li>
          <li><code>get-balance</code>: Check your SY token balance</li>
        </ul>
      </Card>

      <Card>
        <h2>PT/YT Tokens</h2>
        <p>Principal Tokens (PT) and Yield Tokens (YT) split the value of SY tokens.</p>
        <h3>Functions:</h3>
        <ul>
          <li><code>mint-pt-yt</code>: Split SY into PT and YT</li>
          <li><code>redeem-pt</code>: Redeem PT for underlying after maturity</li>
          <li><code>claim-yield</code>: Claim accumulated yield with YT</li>
        </ul>
      </Card>

      <Card>
        <h2>AMM</h2>
        <p>Automated Market Maker for trading PT tokens.</p>
        <h3>Functions:</h3>
        <ul>
          <li><code>add-liquidity</code>: Add PT/SY liquidity to pool</li>
          <li><code>remove-liquidity</code>: Remove liquidity from pool</li>
          <li><code>swap-pt-for-sy</code>: Swap PT tokens for SY</li>
          <li><code>swap-sy-for-pt</code>: Swap SY tokens for PT</li>
        </ul>
      </Card>
    </div>
  )
}
