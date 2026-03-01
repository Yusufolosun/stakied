# Changelog

All notable changes to Stakied Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Planned — Phase 5: Ecosystem & Growth
- Multi-asset vaults (sBTC, LSTs)
- DAO governance token launch
- Mainnet liquidity mining program
- Institutional API access
- Third-party security audit

---

## [1.0.0] - 2026-03-01

### Deployed — Stacks Mainnet

All 10 protocol contracts deployed to Stacks Mainnet.

**Deployer:** `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z`  
**Total cost:** 7.340450 STX (~$1.90)

| Contract | Nonce | Transaction ID |
|---|---|---|
| `stakied-fee-vault` | 1615 | `0x4e008322bec495e203c66ffea33a8167596747feaeefa8b18e3c3c91a45edc74` |
| `stakied-governance` | 1616 | `0xcc2c6cf4128efcc2fa30d7fafa22cd67e3c42d3a1eadc355e634e939c4c6abb2` |
| `stakied-liquidity-gauge` | 1617 | `0x1da22bc7180380ab61f66827354083e3798d43358dab91e5874c914db3e3d091` |
| `stakied-oracle` | 1618 | `0x92c74a1bf07e3d841d9025b0dc01cde24f5b04580887d65baaf979277c390d3e` |
| `stakied-pt-yt-core` | 1619 | `0x8fa73204b1d5bd267a514d98dffa378bf09c8f9740eb292c648ac1393d5808f0` |
| `stakied-sip-010-trait` | 1620 | `0x6a95f6f5bcdd6fc5360a0334e9544dd0521a043ba7a8ccd74c3cddcc22c9d444` |
| `stakied-sy-token` | 1621 | `0x5b963504fec5b0f1aafddec69a5af2c622c65a47e4fabf2b7b2c7e49753c3099` |
| `stakied-pt-yt-amm` | 1622 | `0xe5669d356fd8484a590e4478183a8c424346212fc4ab7c23da638ef361db55c5` |
| `stakied-rewards-distributor` | 1623 | `0xa8a6f35e4de312856bed232bb436393441543506a543f9ffd401fff19af69b7e` |
| `stakied-staking-pool` | 1624 | `0x31351dca7a92e55e0c990be6652415f414c6440bca28c0e5022a3fc7b9383c6b` |

### Added — Phase 4: Premium Frontend
- High-fidelity **Glassmorphism** design system.
- Full `@stacks/connect` and `@stacks/transactions` integration.
- Functional hooks for all core protocol features (Swap, Mint, Stake, Deposit).
- Premium micro-animation suite and custom UI component library.
- Multi-wallet support: Xverse, Hiro, Leather.

### Added — Phase 3: Protocol Hardening & Standardization
- Standardized error schema (u1-u900+) across all 10 contracts.
- Global `set-paused` circuit breakers for operational safety.
- Ownership abstraction via dynamic `contract-owner` data-vars.
- Structured event indexing for all cross-contract operations.
- Clean `clarinet check` status — zero warnings or errors.

### Added — Phase 2: AMM Implementation
- PT/YT AMM contract with constant product formula.
- Time-decay pricing mechanism for expiring yield assets.
- Liquidity provision and LP token emission.
- 0.3% swap fee structure.

### Added — Phase 1: Core Protocol
- SY Token (Standardized Yield) wrapper.
- PT/YT Core engine for tokenization.
- Initial unit test suite (28 tests, 100% pass rate).

### Security
- Hardened `.gitignore` to prevent secret leakage.
- `transfer-ownership` implemented in all core contracts for future DAO transition.
