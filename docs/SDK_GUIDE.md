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
