# Stakied Protocol API Reference

This document provides a comprehensive reference for the public interfaces of all 10 smart contracts in the Stakied protocol ecosystem.

## 📋 Standard Protocol Errors

All contracts adhere to this unified error schema:

| Code | Constant | Meaning |
|------|----------|---------|
| `u1` | `ERR-OWNER-ONLY` | Caller is not the contract owner |
| `u2` | `ERR-NOT-AUTHORIZED` | Caller lacks specific permission |
| `u3` | `ERR-PAUSED` | Contract is currently paused |
| `u4` | `ERR-INVALID-AMOUNT` | Input amount must be greater than zero |
| `u5` | `ERR-INSUFFICIENT-BALANCE` | User lacks required funds |

---

## 💎 SY Token Module
**Contract**: `sy-token.clar`

### Public Functions

#### `deposit`
Wraps underlying stSTX into SY tokens.
- **Parameters**: `(amount uint)`
- **Returns**: `(response uint uint)` -> New SY balance

#### `redeem`
Unwraps SY tokens back to stSTX.
- **Parameters**: `(amount uint)`
- **Returns**: `(response uint uint)` -> Amount redeemed

#### `transfer`
Standard SIP-010 transfer.
- **Parameters**: `(amount uint, sender principal, recipient principal, memo (optional (buff 34)))`
- **Returns**: `(response bool uint)`

---

## ⚙️ PT/YT Core engine
**Contract**: `pt-yt-core.clar`

### Public Functions

#### `mint-pt-yt`
Splits SY into PT and YT pairs.
- **Parameters**: `(amount uint, maturity uint)`
- **Returns**: `(response {pt: uint, yt: uint} uint)`

#### `redeem-matured-pt`
Redeems PT for SY after maturity.
- **Parameters**: `(amount uint, maturity uint)`
- **Returns**: `(response uint uint)`

#### `claim-yield`
Claims accrued yield from YT tokens.
- **Parameters**: `(maturity uint)`
- **Returns**: `(response uint uint)`

---

## 🔄 AMM Module
**Contract**: `pt-yt-amm.clar`

### Public Functions

#### `swap-pt-for-sy`
Sells PT for SY using the time-decay curve.
- **Parameters**: `(amount uint, maturity uint, min-received uint)`
- **Returns**: `(response uint uint)`

#### `add-liquidity`
Provides PT and SY to the maturity-specific pool.
- **Parameters**: `(pt-amount uint, sy-amount uint, maturity uint, min-lp uint)`
- **Returns**: `(response uint uint)`

---

## 💧 Staking & Rewards
**Contracts**: `stakied-staking-pool.clar`, `stakied-rewards-distributor.clar`

### Public Functions

#### `stake`
Stakes LP tokens to earn protocol rewards.
- **Parameters**: `(amount uint)`
- **Returns**: `(response uint uint)`

#### `claim-rewards`
Claims all pending protocol rewards.
- **Parameters**: `()`
- **Returns**: `(response uint uint)`

---

## 🛡️ Administrative Controls
Available in all core contracts.

#### `set-paused`
Halts all critical state changes.
- **Parameters**: `(paused bool)`
- **Returns**: `(response bool uint)`

#### `transfer-ownership`
Transfers contract control to a new principal.
- **Parameters**: `(new-owner principal)`
- **Returns**: `(response bool uint)`

---

**Last Updated**: February 27, 2026. For full Clarity signatures, refer to the individual contract files in `/contracts`.
