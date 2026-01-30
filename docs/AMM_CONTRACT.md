# PT/YT AMM Contract

## Overview
Automated Market Maker for trading Principal Tokens (PT) against SY tokens with time-decay pricing.

## Core Concepts

### Time-Decay Pricing
As maturity approaches, PT price converges to 1 SY (1:1 parity).

**Formula:** `x^(1-t) * y = k`
- `x` = PT reserves
- `y` = SY reserves
- `t` = time progress (0 to 1)
- At maturity: t = 1, PT = 1 SY

### Liquidity Pools
Each maturity date has its own isolated pool with:
- PT reserves
- SY reserves
- LP token supply
- Fee accumulation

## Public Functions

### initialize-pool(maturity, pt-amount, sy-amount)
Creates a new liquidity pool for a specific maturity.

**Parameters:**
- `maturity`: Block height when PT becomes redeemable
- `pt-amount`: Initial PT liquidity
- `sy-amount`: Initial SY liquidity

**Returns:** LP tokens minted

**Errors:**
- `err-pool-already-exists (307)`: Pool exists for this maturity
- `err-invalid-maturity (309)`: Maturity is in the past
- `err-invalid-amount (302)`: Zero or invalid amount provided

**Example:**
```clarity
(contract-call? .pt-yt-amm initialize-pool u500000 u1000000 u1000000)
;; Creates pool for maturity block 500k with 1M PT and 1M SY
```

---

### swap-pt-for-sy(pt-amount, maturity, min-sy-out)
Swaps PT for SY with slippage protection.

**Parameters:**
- `pt-amount`: Amount of PT to swap
- `maturity`: Pool maturity
- `min-sy-out`: Minimum SY to receive (slippage protection)

**Returns:** Actual SY received

**Fee:** 0.3% of input amount

**Errors:**
- `err-pool-not-initialized (306)`: Pool doesn't exist
- `err-slippage-exceeded (305)`: Output below minimum
- `err-insufficient-liquidity (304)`: Not enough SY in pool

**Example:**
```clarity
(contract-call? .pt-yt-amm swap-pt-for-sy u100000 u500000 u99000)
;; Swap 100k PT for at least 99k SY (1% slippage tolerance)
```

---

### swap-sy-for-pt(sy-amount, maturity, min-pt-out)
Swaps SY for PT with slippage protection.

**Parameters:**
- `sy-amount`: Amount of SY to swap
- `maturity`: Pool maturity
- `min-pt-out`: Minimum PT to receive

**Returns:** Actual PT received

**Fee:** 0.3% of input amount

**Example:**
```clarity
(contract-call? .pt-yt-amm swap-sy-for-pt u100000 u500000 u99000)
;; Swap 100k SY for at least 99k PT
```

---

### add-liquidity(maturity, pt-amount, sy-amount, min-lp-out)
Adds liquidity to a pool and mints LP tokens.

**Parameters:**
- `maturity`: Pool maturity
- `pt-amount`: PT to deposit
- `sy-amount`: SY to deposit
- `min-lp-out`: Minimum LP tokens expected

**Returns:** `{pt: actual_pt, sy: actual_sy, lp: lp_minted}`

**Note:** Actual amounts deposited maintain pool ratio. Excess is not transferred.

**Example:**
```clarity
(contract-call? .pt-yt-amm add-liquidity u500000 u500000 u500000 u1)
;; Add 500k PT and 500k SY to pool
```

---

### remove-liquidity(maturity, lp-amount, min-pt-out, min-sy-out)
Removes liquidity and burns LP tokens.

**Parameters:**
- `maturity`: Pool maturity
- `lp-amount`: LP tokens to burn
- `min-pt-out`: Minimum PT expected
- `min-sy-out`: Minimum SY expected

**Returns:** `{pt: pt_returned, sy: sy_returned}`

**Example:**
```clarity
(contract-call? .pt-yt-amm remove-liquidity u500000 u250000 u1 u1)
;; Burn 250k LP tokens, receive proportional PT/SY
```

---

## Read-Only Functions

### quote-swap-pt-for-sy(pt-amount, maturity)
Previews swap output without executing.

**Returns:** `{sy-out, price-impact, fee}`

**Example:**
```clarity
(contract-call? .pt-yt-amm quote-swap-pt-for-sy u100000 u500000)
;; Preview: how much SY for 100k PT?
```

---

### quote-swap-sy-for-pt(sy-amount, maturity)
Previews swap output without executing.

**Returns:** `{pt-out, price-impact, fee}`

---

### get-pool-stats(maturity)
Returns comprehensive pool statistics.

**Returns:**
```clarity
{
  pt-reserve: uint,
  sy-reserve: uint,
  total-lp-supply: uint,
  last-update: uint,
  spot-price: uint,
  time-to-maturity: uint
}
```

---

### get-pool-reserves(maturity)
Returns current pool reserves.

**Returns:** `{pt-reserve, sy-reserve}`

---

### get-lp-balance(user, maturity)
Returns LP token balance for a user in a specific pool.

**Returns:** LP token amount

---

### calculate-time-factor(maturity)
Calculates time progress factor (0 to 1,000,000).

**Returns:** Time factor as fixed-point number

---

### get-spot-price(maturity)
Calculates current PT price in SY terms.

**Returns:** Price as fixed-point number (precision: 1,000,000)

---

## Fee Structure

**Swap Fee:** 0.3% (30 basis points)
**Fee Distribution:** Accrues to liquidity providers automatically
**Fee Calculation:** Applied to input amount before swap

**How fees work:**
1. User swaps 100 PT
2. 0.3 PT taken as fee
3. 99.7 PT enters pool reserves
4. LPs earn via reserve growth

---

## Security Considerations

### Slippage Protection
All swaps and liquidity operations require minimum output amounts to prevent sandwich attacks and excessive slippage.

### Price Impact
Large swaps have higher price impact due to constant product formula. Use quote functions to preview impact.

### Reentrancy Protection
All external calls use `try!` with proper state updates before transfers.

### Time-Based Pricing
Pools become less volatile as maturity approaches, reducing arbitrage risk.

---

## Usage Patterns

### Liquidity Provider Flow
```clarity
;; 1. Deposit SY
(contract-call? .sy-token deposit u2000000)

;; 2. Mint PT/YT
(contract-call? .pt-yt-core mint-pt-yt u1000000 u500000)

;; 3. Initialize or add to pool
(contract-call? .pt-yt-amm add-liquidity u500000 u1000000 u1000000 u1)

;; 4. Later: remove liquidity
(contract-call? .pt-yt-amm remove-liquidity u500000 u500000 u1 u1)
```

### Trader Flow
```clarity
;; 1. Get PT (via minting or buying)
(contract-call? .pt-yt-core mint-pt-yt u1000000 u500000)

;; 2. Preview swap
(contract-call? .pt-yt-amm quote-swap-pt-for-sy u100000 u500000)

;; 3. Execute swap with slippage protection
(contract-call? .pt-yt-amm swap-pt-for-sy u100000 u500000 u90000)
```

---

## Integration Notes

### Contract Dependencies
- `pt-yt-core`: For PT token transfers
- `sy-token`: For SY token transfers

### Events Emitted
All state-changing functions emit print events with:
- `action`: Function name
- Transaction details (amounts, maturity, etc.)
- User principal (implicit in tx-sender)

### Pool Isolation
Each maturity creates an independent pool. Different maturities cannot be combined or arbitraged directly.

---

## Gas Optimization

**Low Cost Operations:**
- Read-only queries (free)
- Quote functions (free)

**Medium Cost Operations:**
- Swaps (~0.002-0.01 STX)
- Add liquidity (~0.002-0.01 STX)

**Higher Cost Operations:**
- Pool initialization (~0.01-0.02 STX)
- Remove liquidity (~0.002-0.01 STX)

---

## Error Reference

| Code | Name | Description |
|------|------|-------------|
| 300 | err-owner-only | Owner-only operation |
| 301 | err-not-authorized | Unauthorized caller |
| 302 | err-invalid-amount | Zero or invalid amount |
| 303 | err-insufficient-balance | Insufficient token balance |
| 304 | err-insufficient-liquidity | Not enough liquidity in pool |
| 305 | err-slippage-exceeded | Output below minimum |
| 306 | err-pool-not-initialized | Pool doesn't exist |
| 307 | err-pool-already-exists | Pool already initialized |
| 308 | err-zero-reserves | Pool has zero reserves |
| 309 | err-invalid-maturity | Maturity in the past |
