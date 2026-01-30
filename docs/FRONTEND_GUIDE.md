# Frontend Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Stacks wallet (Leather, Xverse, etc.)

### Installation

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Utility Classes
- **State Management**: Zustand + React Context
- **Routing**: React Router v6
- **Blockchain**: @stacks/connect, @stacks/transactions

### Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── layout/      # Layout components (Header, Footer, etc.)
│   │   ├── wallet/      # Wallet connection components
│   │   ├── sy-token/    # SY token components
│   │   ├── pt-yt/       # PT/YT token components
│   │   ├── analytics/   # Analytics components
│   │   └── common/      # Common UI components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context providers
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── styles/          # Global styles
├── public/              # Static assets
└── package.json
```

## Components

### Layout Components
- `Header`: Top navigation with wallet button
- `Footer`: Footer with links
- `Navigation`: Main navigation menu
- `Sidebar`: Side navigation

### Wallet Components
- `ConnectWallet`: Wallet connection button
- `WalletInfo`: Display wallet address and balance
- `WalletStatus`: Connection status indicator

### SY Token Components
- `DepositForm`: Deposit STX to mint SY tokens
- `RedeemForm`: Redeem SY tokens for STX
- `BalanceDisplay`: Show SY token balance
- `TransactionHistory`: List of transactions

### PT/YT Components
- `MintForm`: Mint PT/YT from SY tokens
- `RedeemPTForm`: Redeem PT tokens
- `ClaimYieldForm`: Claim yield with YT tokens
- `PTBalance`: Display PT balance
- `YTBalance`: Display YT balance

### Analytics Components
- `PoolStats`: Pool statistics overview
- `UserPositions`: User's active positions
- `YieldCalculator`: Calculate projected yield
- `Charts`: Data visualizations

### Common Components
- `Button`: Customizable button with variants
- `Input`: Form input with validation
- `Card`: Container card component
- `Modal`: Modal dialog
- `Loading`: Loading spinner
- `ErrorMessage`: Error display
- `Spinner`: Loading indicator
- `Badge`: Status badge
- `Alert`: Alert message

## Hooks

### useWallet
Manages wallet connection state.

```typescript
const { address, connected, connect, disconnect } = useWallet()
```

### useContract
Handles contract interactions.

```typescript
const { callFunction, loading, error } = useContract()
```

### useBalance
Fetches token balances.

```typescript
const { balance, loading } = useBalance(address, 'SY')
```

### useTransaction
Executes blockchain transactions.

```typescript
const { executeTransaction, loading, txId } = useTransaction()
```

### useSYToken
SY token specific operations.

```typescript
const { balance, deposit, redeem } = useSYToken(address)
```

### usePTYT
PT/YT token operations.

```typescript
const { ptBalance, ytBalance, mintPTYT, redeemPT } = usePTYT(address)
```

## Styling

### Theme System
The app supports light and dark modes. Toggle with:

```typescript
document.documentElement.setAttribute('data-theme', 'dark')
```

### Utility Classes
Use utility classes for quick styling:

```tsx
<div className="flex items-center justify-between p-4">
  <span className="text-lg font-bold">Balance</span>
  <span className="text-2xl">100 STX</span>
</div>
```

### Custom Styles
Import component-specific styles:

```tsx
import './ComponentName.css'
```

## Building for Production

```bash
npm run build
```

Outputs to `dist/` directory.

## Testing

```bash
npm run test
```

## Deployment

The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- IPFS

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

## Environment Variables

Create `.env` file:

```
VITE_NETWORK=mainnet
VITE_CONTRACT_ADDRESS=SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
