# AMM Mathematical Model

## Constant Product Formula

### Standard AMM
The classic Uniswap-style AMM uses:

```
x * y = k
```

Where:
- `x` = Token X reserves
- `y` = Token Y reserves
- `k` = Constant product (invariant)

### Properties
- **Symmetry**: Tokens are treated equally
- **Price**: `p = y / x` (price of X in terms of Y)
- **Liquidity**: Infinite depth, but with increasing price impact

---

## Time-Decay Modification

### Stakied AMM Formula

```
x^(1-t) * y = k
```

Where:
- `t = (current_block - pool_creation) / (maturity - pool_creation)`
- `0 ≤ t ≤ 1`
- As `t → 0`: Standard constant product
- As `t → 1`: Formula becomes `x^0 * y = k` → `y = k` (constant SY)

### Time Factor Calculation

```clarity
t = (maturity - current_block) / maturity
```

**Simplified in code:**
```clarity
(define-read-only (calculate-time-factor (maturity uint))
  (if (>= block-height maturity)
    precision  ;; t = 1
    (/ (* (- maturity block-height) precision) maturity)
  )
)
```

### Effect on Price
- **Far from maturity** (t ≈ 0): PT can trade at discount/premium
- **Near maturity** (t ≈ 1): PT price → 1 SY (forced convergence)
- **At maturity** (t = 1): PT = 1 SY exactly

---

## Swap Calculations

### PT → SY Swap

Given input `Δx` (PT amount to swap):

**Step 1: Apply Fee**
```
Δx_net = Δx * (1 - fee_rate)
Δx_net = Δx * (10000 - 30) / 10000
Δx_net = Δx * 0.997
```

**Step 2: Calculate Output**
Using constant product formula:
```
(x + Δx_net) * (y - Δy) = x * y
y - Δy = (x * y) / (x + Δx_net)
Δy = y - (x * y) / (x + Δx_net)
Δy = (y * Δx_net) / (x + Δx_net)
```

**In Clarity:**
```clarity
(let (
  (pt-after-fee (/ (* pt-amount (- fee-denominator swap-fee-bps)) fee-denominator))
  (sy-out (/ (* sy-reserve pt-after-fee) (+ pt-reserve pt-after-fee)))
)
  ;; sy-out is the amount user receives
)
```

**Step 3: Update Reserves**
```
x' = x + Δx
y' = y - Δy
```

### SY → PT Swap

Given input `Δy` (SY amount to swap):

**Step 1: Apply Fee**
```
Δy_net = Δy * 0.997
```

**Step 2: Calculate Output**
```
Δx = (x * Δy_net) / (y + Δy_net)
```

**Step 3: Update Reserves**
```
x' = x - Δx
y' = y + Δy
```

---

## Price Impact

### Definition
Price impact measures how much a swap moves the market price:

```
impact = |new_price - old_price| / old_price
```

### Calculation

**Old price:**
```
p_0 = y / x
```

**New price after swapping PT:**
```
p_1 = y' / x' = (y - Δy) / (x + Δx)
```

**Price impact:**
```
impact = |p_1 - p_0| / p_0
       = |(y - Δy)/(x + Δx) - y/x| / (y/x)
```

### Example
**Pool:** 1M PT, 1M SY
**Swap:** 100k PT → ? SY

```
Δx_net = 100k * 0.997 = 99.7k PT
Δy = (1M * 99.7k) / (1M + 99.7k) ≈ 90,679 SY
p_0 = 1M / 1M = 1.0
p_1 = 909,321 / 1,099,700 ≈ 0.827
impact = |0.827 - 1.0| / 1.0 ≈ 17.3%
```

**Price impact increases exponentially with swap size.**

---

## LP Token Valuation

### Initial Pool Creation

When pool is created, initial LP tokens minted:

```
LP_initial = sqrt(x * y)
```

**Geometric mean** ensures fair valuation regardless of initial price.

**Example:**
```
x = 1,000,000 PT
y = 1,000,000 SY
LP = sqrt(1M * 1M) = 1,000,000 LP tokens
```

### Adding Liquidity

LP tokens minted proportional to share added:

```
LP_minted = min(
  (Δx * LP_total) / x,
  (Δy * LP_total) / y
)
```

**Why minimum?**
- Prevents manipulation via unbalanced deposits
- Ensures LPs can't dilute others by adding lopsided liquidity

**Example:**
```
Current pool: 1M PT, 1M SY, 1M LP
Add: 500k PT, 500k SY

LP_from_PT = (500k * 1M) / 1M = 500k
LP_from_SY = (500k * 1M) / 1M = 500k
LP_minted = min(500k, 500k) = 500k

New pool: 1.5M PT, 1.5M SY, 1.5M LP
```

### Removing Liquidity

Tokens returned proportional to LP share:

```
Δx = (LP_burn * x) / LP_total
Δy = (LP_burn * y) / LP_total
```

**Example:**
```
Pool: 1M PT, 1M SY, 1M LP
Burn: 250k LP (25% of total)

PT_out = (250k * 1M) / 1M = 250k PT
SY_out = (250k * 1M) / 1M = 250k SY
```

### LP Share Value

Value of 1 LP token:

```
value_per_LP = (x + y) / LP_total
```

Assuming PT ≈ SY ≈ 1 USD:

```
Pool: 1M PT, 1M SY, 1M LP
value_per_LP = (1M + 1M) / 1M = $2
```

---

## Fee Accrual Mechanics

### How Fees Compound

Fees accrue **directly to reserves**:

1. User swaps 100 PT (fee: 0.3 PT)
2. Only 99.7 PT enters pool calculation
3. But **100 PT added to reserves**
4. Reserve growth → LP value increases

### Mathematical Proof

**Before swap:**
```
LP_value = (x + y) / LP_total
```

**After swap with fee:**
```
x' = x + 100  (not 99.7!)
y' = y - 90.7
LP_total unchanged

LP_value' = (x + 100 + y - 90.7) / LP_total
         = (x + y + 9.3) / LP_total
         > LP_value
```

**Fee captured:** 9.3 tokens worth of value

### Cumulative APY

If pool sees volume `V` per day with fee rate `f`:

```
Daily_fees = V * f
Annual_fees = V * f * 365
APY = (V * f * 365) / TVL
```

**Example:**
```
TVL = $1M
Daily volume = $100k
Fee = 0.3%

Daily_fees = $100k * 0.003 = $300
Annual_fees = $300 * 365 = $109,500
APY = $109,500 / $1M = 10.95%
```

---

## Impermanent Loss

### Definition

Loss compared to holding tokens vs. LPing, due to price divergence.

### Formula

```
IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
```

Where `price_ratio = price_final / price_initial`

### Examples

| Price Change | IL |
|--------------|-----|
| 0% | 0% |
| +25% | -0.6% |
| +50% | -2.0% |
| +100% | -5.7% |
| +200% | -13.4% |
| +500% | -25.5% |

### Mitigation in Stakied

**Time-decay reduces IL risk:**
- PT price converges to 1 SY at maturity
- Predictable end state
- Lower volatility near maturity
- Fees can offset IL if volume is high

---

## Numerical Examples

### Example 1: Small Swap (1% of pool)

**Setup:**
```
Pool: 1,000,000 PT, 1,000,000 SY
Swap: 10,000 PT → ? SY
Fee: 0.3%
```

**Calculation:**
```
PT_after_fee = 10,000 * 0.997 = 9,970
SY_out = (1,000,000 * 9,970) / (1,000,000 + 9,970)
       = 9,970,000,000 / 1,009,970
       ≈ 9,872 SY

Price impact = (1,000,000/1,000,000 - 990,128/1,009,970) / (1,000,000/1,000,000)
             ≈ 1.97%
```

**Result:** 9,872 SY received, ~1.97% price impact

### Example 2: Large Swap (10% of pool)

**Setup:**
```
Pool: 1,000,000 PT, 1,000,000 SY
Swap: 100,000 PT → ? SY
```

**Calculation:**
```
PT_after_fee = 100,000 * 0.997 = 99,700
SY_out = (1,000,000 * 99,700) / (1,000,000 + 99,700)
       = 99,700,000,000 / 1,099,700
       ≈ 90,679 SY

Price impact ≈ 17.3%
```

**Result:** 90,679 SY received, ~17.3% price impact

### Example 3: Liquidity Addition

**Setup:**
```
Pool: 1,000,000 PT, 1,000,000 SY, 1,000,000 LP
Add: 200,000 PT, 200,000 SY
```

**Calculation:**
```
LP_from_PT = (200,000 * 1,000,000) / 1,000,000 = 200,000
LP_from_SY = (200,000 * 1,000,000) / 1,000,000 = 200,000
LP_minted = 200,000

New pool: 1,200,000 PT, 1,200,000 SY, 1,200,000 LP
```

**Result:** User receives 200,000 LP (16.67% of new pool)

---

## Optimization Considerations

### Gas Efficiency
- Integer arithmetic (no floating point)
- Fixed-point precision: 1,000,000 (6 decimals)
- Minimal storage reads/writes

### Precision Loss
- Division rounds down in Clarity
- Maximum precision loss: < 0.0001% per operation
- Negligible for normal trade sizes

### Edge Cases
- Zero reserves: Blocked by assertions
- Overflow: Unlikely with uint (2^128)
- Underflow: Prevented by `unwrap!` and assertions

---

## Summary

| Aspect | Formula | Notes |
|--------|---------|-------|
| **Constant Product** | `x * y = k` | Core invariant |
| **Time Decay** | `x^(1-t) * y = k` | t ∈ [0,1] |
| **Swap Output** | `Δy = y*Δx/(x+Δx)` | After 0.3% fee |
| **LP Mint** | `sqrt(x*y)` | Initial pool |
| **LP Value** | `(x+y)/LP_total` | Per-token value |
| **Price Impact** | `|p₁-p₀|/p₀` | Relative change |
| **Fee APY** | `(V*f*365)/TVL` | From volume |

---

**For more details, see:**
- [AMM_CONTRACT.md](AMM_CONTRACT.md) - Full API reference
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
