# Stakied SDK Guide

## Overview

The Stakied TypeScript/JavaScript SDK provides a complete interface for integrating Stakied Protocol into your applications.

## Installation

Install via npm or yarn:

```bash
npm install @stakied/sdk
# or
yarn add @stakied/sdk
```

### Peer Dependencies

The SDK requires the following peer dependencies:

```bash
npm install @stacks/transactions @stacks/network @stacks/blockchain-api-client
```

## Quick Start

### Basic Setup

```typescript
import { StakiedSDK } from '@stakied/sdk';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

// Initialize for mainnet
const sdk = new StakiedSDK({
  network: new StacksMainnet(),
  contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
});

// Or testnet
const testnetSdk = new StakiedSDK({
  network: new StacksTestnet(),
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
});
```

## Core Methods

### SY Token Operations

#### Deposit Assets

Deposit underlying assets to receive SY tokens:

```typescript
const txOptions = await sdk.sy.deposit({
  amount: 1000,
  senderKey: 'your-private-key',
});

// Broadcast transaction
const txId = await broadcastTransaction(txOptions, network);
console.log(`Transaction ID: ${txId}`);
```

**Parameters:**
- `amount` (number): Amount of underlying asset to deposit
- `senderKey` (string): Private key for signing
- `fee?` (number): Optional custom fee in microSTX

#### Redeem SY Tokens

Burn SY to receive underlying assets:

```typescript
const txOptions = await sdk.sy.redeem({
  amount: 500,
  minOutput: 490,
  senderKey: 'your-private-key',
});

const txId = await broadcastTransaction(txOptions, network);
```

**Parameters:**
- `amount` (number): SY tokens to redeem
- `minOutput` (number): Minimum assets to receive (slippage protection)
- `senderKey` (string): Private key for signing

#### Get SY Balance

Query SY token balance for an address:

```typescript
const balance = await sdk.sy.getBalance('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
console.log(`SY Balance: ${balance}`);
```

**Returns:** Promise<number> - SY token balance

### PT/YT Operations

#### Mint PT and YT

Split SY into Principal and Yield tokens:

```typescript
const txOptions = await sdk.ptYt.mint({
  syAmount: 1000,
  maturity: 1735689600,
  minOutput: 990,
  senderKey: 'your-private-key',
});

const txId = await broadcastTransaction(txOptions, network);
```

**Parameters:**
- `syAmount` (number): SY tokens to split
- `maturity` (number): Unix timestamp of maturity date
- `minOutput` (number): Minimum PT/YT to receive
- `senderKey` (string): Private key for signing

**Note:** Minting produces equal amounts of PT and YT.

#### Redeem PT Tokens

Redeem matured PT for SY:

```typescript
const txOptions = await sdk.ptYt.redeemPt({
  ptAmount: 500,
  maturity: 1735689600,
  minOutput: 495,
  senderKey: 'your-private-key',
});

const txId = await broadcastTransaction(txOptions, network);
```

**Parameters:**
- `ptAmount` (number): PT tokens to redeem
- `maturity` (number): Maturity timestamp
- `minOutput` (number): Minimum SY to receive
- `senderKey` (string): Private key

**Note:** Can only redeem at or after maturity.

#### Claim Yield

Claim accumulated yield from YT holdings:

```typescript
const txOptions = await sdk.ptYt.claimYield({
  maturity: 1735689600,
  senderKey: 'your-private-key',
});

const txId = await broadcastTransaction(txOptions, network);
```

**Parameters:**
- `maturity` (number): Maturity timestamp
- `senderKey` (string): Private key for signing

#### Get PT Balance

Query PT balance for specific maturity:

```typescript
const balance = await sdk.ptYt.getPtBalance(
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  1735689600
);
console.log(`PT Balance: ${balance}`);
```

**Returns:** Promise<number> - PT token balance
