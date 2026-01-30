# Stakied Protocol

**Yield Tokenization for Stacks Blockchain**

Stakied enables splitting yield-bearing assets (liquid staked STX) into Principal Tokens (PT) and Yield Tokens (YT), unlocking fixed-rate DeFi on Bitcoin L2.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-43%20passing-brightgreen)](https://github.com/Yusufolosun/stakied)
[![Clarity](https://img.shields.io/badge/Clarity-2.0-blue.svg)](https://docs.stacks.co/clarity)
[![Stacks](https://img.shields.io/badge/Stacks-Mainnet-purple.svg)](https://www.stacks.co/)
[![AMM](https://img.shields.io/badge/AMM-Phase%202-orange)](https://github.com/Yusufolosun/stakied)

## 🎯 Overview

Stakied is the **first yield tokenization protocol** for the Stacks blockchain, bringing Pendle-style yield trading to Bitcoin L2. It allows users to:

- **Separate principal from yield**: Split yield-bearing stSTX into two distinct tokens
- **Trade future yield**: YT holders can trade their future yield rights
- **Lock in fixed rates**: PT buyers can lock in a fixed yield rate
- **Maximize capital efficiency**: Use PT/YT in other DeFi protocols

## 📊 Architecture

### Contracts

1. **SY Token** ([sy-token.clar](contracts/sy-token.clar)) - Standardized yield wrapper for stSTX
2. **PT/YT Core** ([pt-yt-core.clar](contracts/pt-yt-core.clar)) - Principal/Yield token minting & redemption
3. **PT/YT AMM** ([pt-yt-amm.clar](contracts/pt-yt-amm.clar)) - Automated Market Maker with time-decay pricing (Phase 2)

### Core Mechanics

```
┌──────────┐
│  stSTX   │  Liquid staked STX
└─────┬────┘
      │
      ▼
┌──────────┐
│  SY Token│  Standardized Yield (1:1 wrapper)
└─────┬────┘
      │
      ▼
┌─────────────────────┐
│   PT/YT Minting     │
└──────┬───────┬──────┘
       │       │
       ▼       ▼
┌──────┐   ┌──────┐
│  PT  │   │  YT  │  Principal + Yield Tokens
└──┬───┘   └──────┘
   │
   │ Trade on AMM ⬇️
   ▼
┌──────────────┐
│  PT/YT AMM   │  Time-Decay Pricing
│  (Phase 2)   │  Liquidity Pools, 0.3% fees
└──────────────┘
```

**Flow:**
- `stSTX → SY Token` (1:1 wrapper)
- `SY → PT + YT` (equal amounts, tied to maturity date)
- `PT + YT → SY` (anytime recombination)
- `PT → SY` (post-maturity redemption)
- `YT → Claim yield` (ongoing yield accrual)

## 🚀 Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v3.13+
- Node.js v18+

### Installation

```bash
# Clone the repository
git clone https://github.com/Yusufolosun/stakied
cd stakied

# Install dependencies
npm install

# Run tests
npm test

# Check contracts
clarinet check
```

## 💡 Usage Examples

### Mint PT/YT

```clarity
;; Step 1: Deposit stSTX to get SY
(contract-call? .sy-token deposit u1000000)

;; Step 2: Mint PT/YT using SY
(contract-call? .pt-yt-core mint-pt-yt u1000000 u500000)
;; maturity = block 500,000
```

### Redeem PT After Maturity

```clarity
;; After maturity block is reached
(contract-call? .pt-yt-core redeem-matured-pt u1000000 u500000)
```

### Recombine PT+YT Anytime

```clarity
;; Burn both PT and YT to get SY back
(contract-call? .pt-yt-core redeem-pt-yt u600000 u500000)
```

### Claim YT Yield

```clarity
;; Claim accrued yield from YT tokens
(contract-call? .pt-yt-core claim-yield u500000)
```

### Trade PT on AMM (Phase 2)

```clarity
;; 1. Preview swap
(contract-call? .pt-yt-amm quote-swap-pt-for-sy u100000 u500000)

;; 2. Swap PT for SY (with 1% slippage tolerance)
(contract-call? .pt-yt-amm swap-pt-for-sy u100000 u500000 u99000)

;; 3. Provide liquidity and earn fees
(contract-call? .pt-yt-amm add-liquidity u500000 u500000 u500000 u1)

;; 4. Remove liquidity
(contract-call? .pt-yt-amm remove-liquidity u500000 u250000 u1 u1)
```

## 🏗️ Development

### Project Structure

```
stakied/
├── contracts/
│   ├── sy-token.clar              # SY wrapper contract
│   ├── pt-yt-core.clar            # PT/YT minting/redemption
│   ├── pt-yt-amm.clar             # AMM with time-decay (Phase 2)
│   └── traits/
│       └── sip-010-trait.clar     # Fungible token trait
├── tests/
│   ├── sy-token.test.ts           # SY tests
│   ├── pt-yt-core.test.ts         # PT/YT tests
│   └── pt-yt-amm.test.ts          # AMM tests (Phase 2)
├── docs/
│   ├── ARCHITECTURE.md            # System design
│   ├── SY_CONTRACT.md             # SY documentation
│   ├── PT_YT_CONTRACT.md          # PT/YT documentation
│   ├── AMM_CONTRACT.md            # AMM documentation
│   └── AMM_MATH.md                # AMM mathematics
└── deployments/
    ├── default.simnet-plan.yaml   # Deployment config
    ├── amm-testnet-deploy.sh      # AMM testnet deployment
    └── amm-mainnet-deploy.sh      # AMM mainnet deployment
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:report
```

### Contract Validation

```bash
# Check syntax and analyze
clarinet check

# Interactive console
clarinet console
```

## 🔐 Security

### Phase 1 Features

✅ Maturity enforcement (PT can only be redeemed after maturity)  
✅ Balance validation (all operations check sufficient funds)  
✅ Integer overflow protection (Clarity's built-in safe math)  
✅ Access control (owner-only functions for exchange rate updates)  
✅ Input validation (zero amounts rejected, valid maturity dates)

### Phase 2 Enhancements (Planned)

- [ ] Full SY token integration with custodial pattern
- [ ] Professional audit by Stacks security firm
- [ ] Oracle integration for accurate yield tracking
- [ ] Emergency pause functionality
- [ ] Timelock for critical operations

## 📈 Roadmap

### Phase 1 (Current) ✅
- [x] SY Token contract (yield wrapper)
- [x] PT/YT Core contract (minting/redemption)
- [x] Comprehensive test suite
- [x] Documentation

### Phase 2 (Q2 2026)
- [ ] AMM integration for PT/YT trading
- [ ] Time-decay bonding curve
- [ ] Oracle integration for real-time yield data
- [ ] Frontend application

### Phase 3 (Q3 2026)
- [ ] Multi-asset support (sBTC, other yield assets)
- [ ] Governance token and DAO
- [ ] Automated vault strategies
- [ ] Cross-chain bridges

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - System design and data models
- [SY Contract API](docs/SY_CONTRACT.md) - SY token functions and usage
- [PT/YT Contract API](docs/PT_YT_CONTRACT.md) - PT/YT functions and usage

## 🚀 Deployment

### Testnet
See [Testnet Deployment Guide](docs/TESTNET_DEPLOYMENT.md) for testing instructions.

### Mainnet
See [Mainnet Deployment Guide](docs/MAINNET_DEPLOYMENT.md) for production deployment.

Contract addresses available in [deployments/](deployments/) directory.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All PRs must pass tests and contract validation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Pendle Finance](https://www.pendle.finance/) on Ethereum
- Built on [Stacks](https://www.stacks.co/) blockchain
- Powered by [Clarity](https://clarity-lang.org/) smart contracts
- Supported by Stacks Ecosystem Grant

## 📞 Contact

- GitHub: [@Yusufolosun](https://github.com/Yusufolosun)
- Project: [https://github.com/Yusufolosun/stakied](https://github.com/Yusufolosun/stakied)

---

**⚡ Built with Bitcoin-native DeFi in mind**

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. The contracts have not been professionally audited yet (Phase 2).
