# PT/YT AMM - Phase 2 Roadmap

## Status: Implementation Complete, Awaiting Production Deployment

This document outlines the Phase 2 Automated Market Maker (AMM) for trading Principal Tokens (PT) against Standardized Yield tokens (SY).

## Overview

The PT/YT AMM enables efficient trading between Principal Tokens and SY tokens with time-decay pricing that reflects the decreasing time value as tokens approach maturity.

### Key Features

- Constant product AMM formula (x * y = k)
- Time-decay pricing mechanism
- 0.3% swap fee
- Automated liquidity provision
- Slippage protection

## Technical Architecture

The AMM contract implements a decentralized exchange for PT/SY trading with the following components:

### Core Components

1. **Liquidity Pools**: Each PT maturity has its own isolated pool paired with SY
2. **Price Discovery**: Constant product formula with time-decay adjustment
3. **Fee Structure**: 0.3% protocol fee on all swaps, distributed to liquidity providers
4. **LP Tokens**: Fungible tokens representing proportional ownership of pool liquidity
