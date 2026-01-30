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
