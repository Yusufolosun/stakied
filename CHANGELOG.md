# Changelog

All notable changes to Stakied Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Phase 4: Premium Frontend Revamp**
  - High-fidelity **Glassmorphism** design system.
  - Full `@stacks/connect` and `@stacks/transactions` integration.
  - Automated functional hooks for all core protocol features (Swap, Mint, Stake, Deposit).
  - Premium micro-animation suite and custom UI component library.
  - Multi-wallet support (Xverse, Hiro, Leather).
- **Phase 3: Protocol Hardening & Standardization**
  - Standardized error schema (u1-u900+) across all 10 contracts.
  - Global `set-paused` circuit breakers for operational safety.
  - Ownership abstraction via dynamic `contract-owner` data-vars.
  - Structured event indexing for all cross-contract operations.
  - Comprehensive architectural security audit and clean `clarinet check` status.
- **Phase 2: AMM Implementation**
  - PT/YT AMM contract with constant product formula.
  - Time-decay pricing mechanism for expiring yield assets.
  - Liquidity provision and LP token emission.
  - 0.3% swap fee structure.
- **Phase 1: Core Protocol**
  - SY Token (Standardized Yield) wrapper.
  - PT/YT Core engine for tokenization.
  - Initial unit test suite.

### Security
- Hardened `.gitignore` to prevent secret leakage.
- Implementation of `transfer-ownership` in all core contracts for future DAO transition.
