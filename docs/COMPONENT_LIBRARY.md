# Component Library

## Table of Contents
- [Layout Components](#layout-components)
- [Wallet Components](#wallet-components)
- [Token Components](#token-components)
- [Analytics Components](#analytics-components)
- [Common Components](#common-components)

---

## Layout Components

### Header
Top navigation bar with branding and wallet connection.

```tsx
import { Header } from './components/layout/Header'

<Header />
```

**Features:**
- Logo and branding
- Main navigation menu
- Wallet connection button
- Responsive design

---

### Footer
Bottom footer with links and information.

```tsx
import { Footer } from './components/layout/Footer'

<Footer />
```

---

### Navigation
Main navigation menu.

```tsx
import { Navigation } from './components/layout/Navigation'

<Navigation />
```

**Links:**
- Home
- Deposit
- Mint
- Redeem
- Pool
- Analytics
- Docs

---

## Wallet Components

### ConnectWallet
Button to connect Stacks wallet.

```tsx
import { ConnectWallet } from './components/wallet/ConnectWallet'

<ConnectWallet />
```

**Props:**
- `onConnect?: () => void` - Callback after successful connection

**Features:**
- Integrates with Stacks Connect
- Shows loading state
- Error handling

---

### WalletInfo
Display connected wallet information.

```tsx
import { WalletInfo } from './components/wallet/WalletInfo'

<WalletInfo />
```

**Displays:**
- Wallet address (truncated)
- STX balance
- Network (mainnet/testnet)

---

## Token Components

### DepositForm
Form to deposit STX and mint SY tokens.

```tsx
import { DepositForm } from './components/sy-token/DepositForm'

<DepositForm />
```

**Features:**
- Amount input with validation
- Balance display
- Transaction submission
- Loading states
- Error messages

---

### RedeemForm
Form to redeem SY tokens for STX.

```tsx
import { RedeemForm } from './components/sy-token/RedeemForm'

<RedeemForm />
```

---

### MintForm
Form to mint PT/YT tokens from SY.

```tsx
import { MintForm } from './components/pt-yt/MintForm'

<MintForm />
```

**Props:**
- Amount of SY to split
- Maturity date selection

---

### RedeemPTForm
Form to redeem PT tokens.

```tsx
import { RedeemPTForm } from './components/pt-yt/RedeemPTForm'

<RedeemPTForm />
```

**Requirements:**
- PT tokens must be matured
- Sufficient PT balance

---

### ClaimYieldForm
Form to claim yield with YT tokens.

```tsx
import { ClaimYieldForm } from './components/pt-yt/ClaimYieldForm'

<ClaimYieldForm />
```

---

## Analytics Components

### PoolStats
Display pool statistics.

```tsx
import { PoolStats } from './components/analytics/PoolStats'

<PoolStats />
```

**Metrics:**
- Total Value Locked (TVL)
- Total SY Deposited
- Active Positions
- Total Yield Generated

---

### UserPositions
Show user's active positions.

```tsx
import { UserPositions } from './components/analytics/UserPositions'

<UserPositions />
```

**Displays:**
- Position type (SY/PT/YT)
- Amount
- Maturity date
- Current yield

---

### YieldCalculator
Calculate projected yield.

```tsx
import { YieldCalculator } from './components/analytics/YieldCalculator'

<YieldCalculator />
```

**Inputs:**
- Deposit amount
- Duration (days)

**Output:**
- Estimated yield based on current APY

---

## Common Components

### Button
Customizable button component.

```tsx
import { Button } from './components/common/Button'

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger'` - Button style
- `disabled?: boolean` - Disable button
- `loading?: boolean` - Show loading state
- `onClick?: () => void` - Click handler

---

### Input
Form input component.

```tsx
import { Input } from './components/common/Input'

<Input
  label="Amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  placeholder="0.0"
/>
```

**Props:**
- `label?: string` - Input label
- `placeholder?: string` - Placeholder text
- `value: string` - Input value
- `onChange: (e) => void` - Change handler
- `error?: string` - Error message
- `disabled?: boolean` - Disable input

---

### Card
Container card component.

```tsx
import { Card } from './components/common/Card'

<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

**Features:**
- Styled container
- Shadow and borders
- Responsive padding

---

### Modal
Modal dialog component.

```tsx
import { Modal } from './components/common/Modal'

<Modal isOpen={isOpen} onClose={handleClose}>
  <h2>Modal Title</h2>
  <p>Modal content</p>
</Modal>
```

**Props:**
- `isOpen: boolean` - Control visibility
- `onClose: () => void` - Close handler
- `children: ReactNode` - Modal content

---

### Loading
Loading spinner.

```tsx
import { Loading } from './components/common/Loading'

<Loading />
```

---

### ErrorMessage
Display error messages.

```tsx
import { ErrorMessage } from './components/common/ErrorMessage'

<ErrorMessage message="Transaction failed" />
```

---

### Badge
Status badge component.

```tsx
import { Badge } from './components/common/Badge'

<Badge variant="success">Active</Badge>
```

**Variants:**
- `success` - Green badge
- `warning` - Yellow badge
- `error` - Red badge
- `info` - Blue badge

---

### Alert
Alert message component.

```tsx
import { Alert } from './components/common/Alert'

<Alert type="success">Transaction successful!</Alert>
```

**Types:**
- `success`
- `warning`
- `error`
- `info`

---

## Usage Examples

### Complete Deposit Flow

```tsx
import { DepositForm } from './components/sy-token/DepositForm'
import { BalanceDisplay } from './components/sy-token/BalanceDisplay'
import { TransactionHistory } from './components/sy-token/TransactionHistory'

function DepositPage() {
  return (
    <div>
      <h1>Deposit STX</h1>
      <BalanceDisplay />
      <DepositForm />
      <TransactionHistory />
    </div>
  )
}
```

### Complete Mint Flow

```tsx
import { MintForm } from './components/pt-yt/MintForm'
import { PTBalance } from './components/pt-yt/PTBalance'
import { YTBalance } from './components/pt-yt/YTBalance'

function MintPage() {
  return (
    <div>
      <h1>Mint PT/YT Tokens</h1>
      <div className="balances">
        <PTBalance />
        <YTBalance />
      </div>
      <MintForm />
    </div>
  )
}
```
