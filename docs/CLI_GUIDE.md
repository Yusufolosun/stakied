# Stakied CLI Guide

## Overview

The Stakied command-line interface (CLI) provides tools for interacting with Stakied Protocol contracts directly from your terminal.

## Installation

Install the Stakied CLI globally using npm:

```bash
npm install -g @stakied/cli
```

Or use with npx without installation:

```bash
npx @stakied/cli <command>
```

### Requirements

- Node.js v18 or higher
- Stacks wallet with STX for gas fees
- Private key or seed phrase for transaction signing

## Configuration

Configure your wallet and network settings:

```bash
# Set network (mainnet, testnet, or devnet)
stakied config set-network mainnet

# Configure wallet using private key
stakied config set-key <your-private-key>

# Or use seed phrase
stakied config set-seed "<your-24-word-seed-phrase>"

# View current configuration
stakied config show
```

Configuration is stored in `~/.stakied/config.json`

## Commands

### SY Token Operations

#### Deposit Assets to SY

Deposit underlying assets to receive Standardized Yield tokens:

```bash
stakied sy deposit <amount> [options]

# Examples
stakied sy deposit 1000                    # Deposit 1000 units
stakied sy deposit 1000 --token STX        # Specify token type
stakied sy deposit 1000 --dry-run          # Preview without executing
```

**Options:**
- `--token <symbol>`: Underlying asset to deposit (default: STX)
- `--dry-run`: Simulate transaction without broadcasting
- `--fee <amount>`: Custom transaction fee in microSTX

#### Redeem SY for Assets

Burn SY tokens to receive underlying assets:

```bash
stakied sy redeem <amount> [options]

# Examples
stakied sy redeem 500                      # Redeem 500 SY
stakied sy redeem 500 --min-output 490     # With slippage protection
```

**Options:**
- `--min-output <amount>`: Minimum assets to receive
- `--dry-run`: Simulate transaction
- `--fee <amount>`: Custom transaction fee

### PT/YT Operations

#### Mint PT and YT

Split SY tokens into Principal and Yield tokens:

```bash
stakied pt-yt mint <sy-amount> <maturity> [options]

# Examples
stakied pt-yt mint 1000 1735689600         # Mint from 1000 SY
stakied pt-yt mint 1000 2025-01-01         # Use date format
stakied pt-yt mint 1000 1735689600 --min-output 990
```

**Options:**
- `--min-output <amount>`: Minimum PT/YT to receive
- `--dry-run`: Simulate transaction
- `--fee <amount>`: Custom transaction fee

**Note:** Minting creates equal amounts of PT and YT tokens.

#### Redeem PT Tokens

Redeem matured PT tokens for underlying SY:

```bash
stakied pt-yt redeem <pt-amount> <maturity> [options]

# Examples
stakied pt-yt redeem 500 1735689600        # Redeem 500 PT
stakied pt-yt redeem 500 1735689600 --min-output 495
```

**Options:**
- `--min-output <amount>`: Minimum SY to receive
- `--dry-run`: Simulate transaction
- `--fee <amount>`: Custom transaction fee

**Note:** PT can only be redeemed at or after maturity date.

#### Claim Yield

Claim accumulated yield from YT tokens:

```bash
stakied pt-yt claim <maturity> [options]

# Examples
stakied pt-yt claim 1735689600             # Claim all available yield
stakied pt-yt claim 1735689600 --dry-run   # Preview yield amount
```

**Options:**
- `--dry-run`: Show claimable yield without claiming
- `--fee <amount>`: Custom transaction fee

### Query Commands

#### Check Balances

View your token balances:

```bash
stakied balance [token] [options]

# Examples
stakied balance                    # Show all balances
stakied balance SY                 # Show SY balance only
stakied balance PT 1735689600      # Show PT balance for maturity
stakied balance YT 1735689600      # Show YT balance for maturity
```

#### View Pool Information

Get current AMM pool state:

```bash
stakied pool info <maturity>

# Example
stakied pool info 1735689600

# Output:
# PT Reserve: 50,000
# SY Reserve: 100,000
# LP Supply: 70,711
# Current Price: 1 PT = 2.0 SY
```

### AMM Trading Commands

#### Swap PT for SY

Sell PT tokens to the AMM pool:

```bash
stakied amm swap-pt <amount> <maturity> <min-output> [options]

# Examples
stakied amm swap-pt 1000 1735689600 950
stakied amm swap-pt 1000 1735689600 950 --dry-run
```

#### Swap SY for PT

Buy PT tokens from the AMM pool:

```bash
stakied amm swap-sy <amount> <maturity> <min-output> [options]

# Examples
stakied amm swap-sy 2000 1735689600 950
```

#### Add Liquidity

Provide liquidity to AMM pool:

```bash
stakied amm add-liquidity <maturity> <pt-amount> <sy-amount> <min-lp> [options]

# Example
stakied amm add-liquidity 1735689600 1000 2000 950
```

#### Remove Liquidity

Withdraw liquidity from AMM pool:

```bash
stakied amm remove-liquidity <maturity> <lp-tokens> <min-pt> <min-sy> [options]

# Example
stakied amm remove-liquidity 1735689600 500 450 900
```

## Common Workflows

### Fixed Yield Strategy

Lock in guaranteed returns using PT tokens:

```bash
# 1. Deposit assets to get SY
stakied sy deposit 10000

# 2. Mint PT and YT
stakied pt-yt mint 10000 1735689600

# 3. Sell YT for additional PT (via AMM)
stakied amm swap-yt 10000 1735689600 4500

# 4. Hold PT until maturity
# 5. Redeem PT for SY
stakied pt-yt redeem 14500 1735689600

# Result: Fixed 45% return regardless of yield fluctuations
```
