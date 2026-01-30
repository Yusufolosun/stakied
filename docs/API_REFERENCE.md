# Stakied Protocol API Reference

## Overview

Complete technical reference for all Stakied Protocol smart contracts and their public interfaces.

## SY Token Contract

### Contract Address
- **Mainnet**: `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.sy-token`
- **Testnet**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sy-token`

### Public Functions

#### `deposit`

Deposits underlying assets to receive Standardized Yield tokens.

```clarity
(define-public (deposit (amount uint))
  (response {sy-amount: uint} uint)
)
```

**Parameters:**
- `amount` (uint): Amount of underlying asset to deposit

**Returns:**
- Success: `(ok {sy-amount: uint})` - Amount of SY tokens minted
- Error codes:
  - `u1` - Not authorized
  - `u2` - Invalid amount (zero or negative)

**Access:** Public

#### `redeem`

Redeems SY tokens for underlying assets.

```clarity
(define-public (redeem (sy-amount uint))
  (response {asset-amount: uint} uint)
)
```

**Parameters:**
- `sy-amount` (uint): Amount of SY tokens to burn

**Returns:**
- Success: `(ok {asset-amount: uint})` - Amount of underlying assets returned
- Error codes:
  - `u1` - Not authorized
  - `u2` - Invalid amount
  - `u3` - Insufficient SY balance

**Access:** Public

### Read-Only Functions

#### `get-balance`

Returns SY token balance for an address.

```clarity
(define-read-only (get-balance (account principal))
  (response uint uint)
)
```

**Parameters:**
- `account` (principal): Address to query

**Returns:**
- `(ok uint)` - SY token balance

**Access:** Public, read-only
