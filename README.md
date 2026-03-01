# Stakied Protocol

**The Premier Yield Tokenization & Trading Protocol for Bitcoin L2.**

Stakied enables splitting yield-bearing assets (liquid staked STX) into Principal Tokens (PT) and Yield Tokens (YT), unlocking fixed-rate DeFi and yield speculation on the Stacks blockchain.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Yusufolosun/stakied)
[![Clarity](https://img.shields.io/badge/Clarity-2.0-blue.svg)](https://docs.stacks.co/clarity)
[![Stacks](https://img.shields.io/badge/Stacks-Mainnet-purple.svg)](https://www.stacks.co/)
[![Design](https://img.shields.io/badge/UI-Premium%20Glassmorphism-blueviolet)](https://github.com/Yusufolosun/stakied/tree/main/frontend)

## 🎯 Overview

Stakied is a specialized DeFi protocol built on Stacks, bringing advanced yield trading primitives to the Bitcoin ecosystem. By standardizing yield-bearing assets, Stakied allows users to:

- **Lock in Fixed Yields**: Buy Principal Tokens (PT) at a discount to secure a fixed rate until maturity.
- **Leverage Yield Exposure**: Hold Yield Tokens (YT) to capture 100% of the yield from a larger amount of principal.
- **Provide Liquidity**: Earn trading fees and protocol rewards by fueling the PT-SY AMM.
- **Maximize Capital Efficiency**: Re-deploy principal or yield components into other DeFi protocols.

## ✨ Premium Interface

The Stakied dApp features a custom-built, high-fidelity **Glassmorphism** interface designed for institutional-grade users.
- **Wallet Support**: Native integration with Xverse, Hiro, and Leather wallets.
- **Real-time Analytics**: On-chain data feeds for TVL, APY, and market volume.
- **Seamless Flows**: Automated wrapping (SY), tokenization (PT/YT), and AMM trading.

## 🏗️ Technical Architecture

### Core Contracts (Hardened)

1.  **[SY Token](contracts/sy-token.clar)**: Standardized yield wrapper for stSTX.
2.  **[PT/YT Core](contracts/pt-yt-core.clar)**: Central engine for minting and maturing PT/YT pairs.
3.  **[PT/YT AMM](contracts/pt-yt-amm.clar)**: Specialized AMM with time-decay pricing curves.
4.  **[Staking Pool](contracts/stakied-staking-pool.clar)**: High-yield vault for LP token rewards.
5.  **[Governance](contracts/stakied-governance.clar)**: Decentralized ownership and protocol control.

### Security Features
- **Dynamic Governance**: Abstracted ownership via data-vars in all 10 core contracts.
- **Circuit Breakers**: Global `pause` mechanisms for emergency protocol halting.
- **Standardized Error Schema**: Unified numeric error codes (u1-u900+) for robust indexing and frontend handling.
- **Ownership Transfer**: Protocol-ready for DAO or multi-sig management.

## 🚀 Getting Started

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) v3.13+
- [Node.js](https://nodejs.org/) v18+
- [Stacks Wallet](https://www.hiro.so/wallet) (Xverse, Hiro, or Leather)

### Quick Launch
```bash
# Clone & Install
git clone https://github.com/Yusufolosun/stakied
cd stakied
npm install

# Check Contracts
clarinet check

# Launch Premium Frontend
cd frontend
npm install
npm run dev
```

## 🌐 Live on Mainnet

All 10 protocol contracts are deployed and confirmed on Stacks Mainnet.

**Deployer:** `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z`  
**Deployed:** March 1, 2026 | **Total cost:** 7.340450 STX

| Contract | Address |
|---|---|
| stakied-sip-010-trait | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-sip-010-trait` |
| stakied-sy-token | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-sy-token` |
| stakied-pt-yt-core | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-pt-yt-core` |
| stakied-pt-yt-amm | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-pt-yt-amm` |
| stakied-staking-pool | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-staking-pool` |
| stakied-governance | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-governance` |
| stakied-fee-vault | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-fee-vault` |
| stakied-oracle | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-oracle` |
| stakied-rewards-distributor | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-rewards-distributor` |
| stakied-liquidity-gauge | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.stakied-liquidity-gauge` |

Full transaction IDs and explorer links → [`deployments/MAINNET_ADDRESSES.md`](deployments/MAINNET_ADDRESSES.md)

## 📖 Roadmap

### Phase 1: Core Protocol ✅
- [x] SY Token Contract
- [x] PT/YT Tokenization Engine
- [x] Comprehensive Test Suite

### Phase 2: AMM & Trading ✅
- [x] Time-Decay Bonding Curve
- [x] Liquidity Provider Incentives
- [x] AMM Mathematics Verification

### Phase 3: Hardening & Standardization ✅
- [x] Standardized Error Schema
- [x] Emergency Pause Mechanisms
- [x] Dynamic Governance Abstraction
- [x] Protocol-wide Event Indexing

### Phase 4: Premium Frontend ✅
- [x] Glassmorphism Design System
- [x] @stacks/connect Functional Integration
- [x] Real-time Balance & Yield Tracking

### Phase 5: Ecosystem & Growth (Q3 2026)
- [ ] Multi-asset Vaults (sBTC, LSTs)
- [ ] DAO Launch & Governance Token
- [ ] Mainnet Liquidity Mining Program
- [ ] Institutional API Access

## 📚 Documentation
- **[Architecture Deep-Dive](docs/ARCHITECTURE.md)**: Full protocol specs.
- **[Security Model](docs/SECURITY_MODEL.md)**: Hardening features and audits.
- **[API Reference](docs/API_REFERENCE.md)**: Contract function signatures.
- **[Frontend Guide](docs/FRONTEND_GUIDE.md)**: UI/UX development standards.

## 🤝 Contributing
We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for standards.

## 📄 License
Licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**⚡ Built for the Bitcoin Economy on Stacks.**

**⚠️ Disclaimer**: Experimental software. Contracts are hardened but not yet formally audited. Use at your own risk.
