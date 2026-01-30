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
