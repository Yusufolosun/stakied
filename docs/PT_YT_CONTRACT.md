# PT/YT Core Contract API Documentation

## Overview

The PT/YT Core contract manages the minting and redemption of Principal Tokens (PT) and Yield Tokens (YT) from SY tokens. This enables users to separate and trade the principal and yield components of their yield-bearing assets.

**Contract**: `pt-yt-core.clar`  
**Dependencies**: sy-token.clar  

## Concepts

- **PT (Principal Token)**: Represents the principal amount, redeemable 1:1 for SY after maturity
- **YT (Yield Token)**: Represents the right to claim future yield until maturity
- **Maturity**: Block height at which PT becomes redeemable
- **Recombination**: Burning both PT and YT to get SY back (anytime)

## Public Functions

### mint-pt-yt

Mints equal amounts of PT and YT tokens for a given maturity date.

**Signature**:
```clarity
(define-public (mint-pt-yt (sy-amount uint) (maturity uint)) 
  (response {pt: uint, yt: uint} uint))
```

**Parameters**:
- `sy-amount` (uint): Amount of SY tokens to convert
- `maturity` (uint): Block height when PT becomes redeemable

**Returns**:
- `(ok {pt: uint, yt: uint})`: Amounts of PT and YT minted (always equal)
- `(err u202)`: Invalid amount (zero)
- `(err u206)`: Invalid maturity (maturity <= current block height)

**Example**:
```clarity
;; Mint PT/YT for maturity at block 500,000
(contract-call? .pt-yt-core mint-pt-yt u1000000 u500000)
;; Returns: (ok {pt: u1000000, yt: u1000000})
```

**Events Emitted**:
```clarity
{
  action: "mint-pt-yt", 
  user: principal, 
  amount: uint, 
  maturity: uint
}
```

**Important**: In Phase 1, this function doesn't transfer SY from the user. Full integration planned for Phase 2.

---

### redeem-matured-pt

Redeems PT tokens for SY after maturity is reached.

**Signature**:
```clarity
(define-public (redeem-matured-pt (pt-amount uint) (maturity uint)) 
  (response uint uint))
```

**Parameters**:
- `pt-amount` (uint): Amount of PT to redeem
- `maturity` (uint): Maturity block height

**Returns**:
- `(ok uint)`: Amount of SY returned
- `(err u202)`: Invalid amount (zero)
- `(err u203)`: Insufficient PT balance
- `(err u204)`: Maturity not reached yet

**Example**:
```clarity
;; After block 500,000 is reached
(contract-call? .pt-yt-core redeem-matured-pt u500000 u500000)
;; Returns: (ok u500000)
```

**Events Emitted**:
```clarity
{
  action: "redeem-pt", 
  user: principal, 
  amount: uint, 
  maturity: uint
}
```

**Maturity Enforcement**: Can only redeem PT when `stacks-block-height >= maturity`

---

### redeem-pt-yt

Recombines PT and YT to redeem SY. Can be done anytime before or after maturity.

**Signature**:
```clarity
(define-public (redeem-pt-yt (amount uint) (maturity uint)) 
  (response uint uint))
```

**Parameters**:
- `amount` (uint): Amount of PT and YT to burn (must have equal amounts of both)
- `maturity` (uint): Maturity block height

**Returns**:
- `(ok uint)`: Amount of SY returned
- `(err u202)`: Invalid amount (zero)
- `(err u203)`: Insufficient PT or YT balance

**Example**:
```clarity
;; Recombine 600,000 PT+YT to get 600,000 SY back
(contract-call? .pt-yt-core redeem-pt-yt u600000 u500000)
;; Returns: (ok u600000)
```

**Events Emitted**:
```clarity
{
  action: "redeem-pt-yt", 
  user: principal, 
  amount: uint, 
  maturity: uint
}
```

**Use Case**: Exit position early without waiting for maturity

---

### claim-yield

Claims accrued yield based on YT token holdings.

**Signature**:
```clarity
(define-public (claim-yield (maturity uint)) 
  (response uint uint))
```

**Parameters**:
- `maturity` (uint): Maturity block height

**Returns**:
- `(ok uint)`: Amount of yield claimed
- `(err u202)`: No claimable yield (zero YT balance or already claimed)

**Example**:
```clarity
;; Claim yield for maturity 500,000
(contract-call? .pt-yt-core claim-yield u500000)
;; Returns: (ok u8000000) ;; Example yield amount
```

**Events Emitted**:
```clarity
{
  action: "claim-yield", 
  user: principal, 
  amount: uint, 
  maturity: uint
}
```

**Yield Calculation** (Phase 1): Uses simplified formula `YT balance * 8`  
**Phase 2**: Will integrate real-time yield data from oracles

---

## Read-Only Functions

### get-pt-balance

Returns PT balance for a user at specific maturity.

**Signature**:
```clarity
(define-read-only (get-pt-balance (user principal) (maturity uint)) 
  (response uint uint))
```

**Parameters**:
- `user` (principal): User address
- `maturity` (uint): Maturity block height

**Returns**:
```clarity
(ok uint) ;; PT balance (0 if none)
```

**Example**:
```clarity
(contract-call? .pt-yt-core get-pt-balance 
  'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 
  u500000)
;; Returns: (ok u1000000)
```

---

### get-yt-balance

Returns YT balance for a user at specific maturity.

**Signature**:
```clarity
(define-read-only (get-yt-balance (user principal) (maturity uint)) 
  (response uint uint))
```

**Parameters**:
- `user` (principal): User address
- `maturity` (uint): Maturity block height

**Returns**:
```clarity
(ok uint) ;; YT balance (0 if none)
```

---

### get-pt-total-supply

Returns total PT supply for a given maturity.

**Signature**:
```clarity
(define-read-only (get-pt-total-supply (maturity uint)) 
  (response uint uint))
```

**Returns**:
```clarity
(ok uint) ;; Total PT for this maturity
```

---

### get-yt-total-supply

Returns total YT supply for a given maturity.

**Signature**:
```clarity
(define-read-only (get-yt-total-supply (maturity uint)) 
  (response uint uint))
```

**Returns**:
```clarity
(ok uint) ;; Total YT for this maturity
```

---

### calculate-claimable-yield

Calculates how much yield a user can claim with their YT.

**Signature**:
```clarity
(define-read-only (calculate-claimable-yield (user principal) (maturity uint)) 
  (response uint uint))
```

**Parameters**:
- `user` (principal): User address
- `maturity` (uint): Maturity block height

**Returns**:
```clarity
(ok uint) ;; Claimable yield amount
```

**Example**:
```clarity
(contract-call? .pt-yt-core calculate-claimable-yield tx-sender u500000)
;; Returns: (ok u8000000)
```

---

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| u200 | `err-owner-only` | Function reserved for contract owner (unused in Phase 1) |
| u201 | `err-not-authorized` | Caller not authorized (unused in Phase 1) |
| u202 | `err-invalid-amount` | Amount is zero or invalid |
| u203 | `err-insufficient-balance` | Insufficient PT or YT balance |
| u204 | `err-maturity-not-reached` | Cannot redeem PT before maturity |
| u205 | `err-already-matured` | Operation not allowed after maturity (unused) |
| u206 | `err-invalid-maturity` | Maturity must be in the future |

---

## Usage Patterns

### Complete PT/YT Lifecycle

```clarity
;; 1. Get SY tokens first
(contract-call? .sy-token deposit u5000000)

;; 2. Mint PT/YT for maturity at block 600,000
(contract-call? .pt-yt-core mint-pt-yt u5000000 u600000)
;; Result: PT balance = 5,000,000, YT balance = 5,000,000

;; 3. Claim yield periodically (YT holders)
(contract-call? .pt-yt-core claim-yield u600000)
;; Result: Yield transferred to user

;; 4. Wait for maturity...
;; [Block 600,000 reached]

;; 5. Redeem PT for SY
(contract-call? .pt-yt-core redeem-matured-pt u5000000 u600000)
;; Result: 5,000,000 SY returned
```

### Early Exit via Recombination

```clarity
;; User has: 3,000,000 PT + 3,000,000 YT at maturity 600,000
;; Current block: 550,000 (before maturity)

;; Recombine to get SY back early
(contract-call? .pt-yt-core redeem-pt-yt u3000000 u600000)
;; Result: 3,000,000 SY returned immediately
```

### Yield Trading Scenario

```clarity
;; User A: Wants fixed rate (sells YT, keeps PT)
;; 1. Mint PT/YT
(contract-call? .pt-yt-core mint-pt-yt u10000000 u700000)

;; 2. Sell YT to User B (via AMM or P2P - Phase 2)
;; User A now has: 10M PT, 0 YT
;; User B now has: 0 PT, 10M YT

;; 3. User B claims all the yield
(contract-call? .pt-yt-core claim-yield u700000)

;; 4. After maturity, User A redeems PT
(contract-call? .pt-yt-core redeem-matured-pt u10000000 u700000)
```

### Multiple Maturities

```clarity
;; User can have positions across different maturities
(contract-call? .pt-yt-core mint-pt-yt u2000000 u500000) ;; Short-term
(contract-call? .pt-yt-core mint-pt-yt u3000000 u700000) ;; Medium-term
(contract-call? .pt-yt-core mint-pt-yt u5000000 u1000000) ;; Long-term

;; Each maturity is tracked independently
(contract-call? .pt-yt-core get-pt-balance tx-sender u500000)
;; => (ok u2000000)

(contract-call? .pt-yt-core get-pt-balance tx-sender u700000)
;; => (ok u3000000)
```

---

## Integration Notes

### Phase 2 Enhancements

#### SY Token Integration

Currently placeholder:
```clarity
;; TODO Phase 2: Transfer SY from user to this contract
```

Will be implemented as:
```clarity
(try! (contract-call? .sy-token transfer-from 
  sy-amount 
  tx-sender 
  (as-contract tx-sender) 
  none))
```

Requires:
1. Allowance mechanism in SY contract
2. User pre-approves PT/YT contract to spend their SY
3. Proper error handling for failed transfers

#### Real Yield Calculation

Current simplified formula:
```clarity
(let ((total-yield (* user-yt-balance u8)))
```

Phase 2 will use:
```clarity
(let (
  (current-rate (unwrap! (contract-call? .sy-token get-exchange-rate) err-invalid-amount))
  (initial-rate (unwrap! (map-get? maturity-initial-rates maturity) err-invalid-amount))
  (yield-per-token (- current-rate initial-rate))
  (total-yield (* user-yt-balance yield-per-token))
)
```

---

## Security Considerations

### Maturity Enforcement

✅ **PT Redemption**: Strictly enforced via `stacks-block-height >= maturity` check  
✅ **Minting**: Only allows future maturities via `maturity > stacks-block-height`  
✅ **Recombination**: No maturity restrictions (allows early exit)

### Balance Protection

✅ All operations check sufficient balances before burning  
✅ Separate balances per (user, maturity) pair  
✅ No cross-contamination between different maturities

### Yield Claiming

✅ Tracks claimed amounts to prevent double-claiming  
✅ Returns zero when no claimable yield remains  
✅ Per-user, per-maturity tracking

### Known Limitations

⚠️ **No SY Integration**: PT/YT contracts don't actually hold SY (Phase 1)  
⚠️ **Simplified Yield**: Uses placeholder calculation instead of real yield data  
⚠️ **No Trading**: Users cannot trade PT/YT yet (requires AMM in Phase 2)

---

## Testing

See [tests/pt-yt-core.test.ts](../tests/pt-yt-core.test.ts) for comprehensive coverage:

- ✅ PT/YT minting with various amounts and maturities
- ✅ Maturity validation (past/future)
- ✅ PT redemption before/after maturity
- ✅ PT+YT recombination
- ✅ Yield claiming and double-claim prevention
- ✅ Balance insufficiency handling
- ✅ Multiple maturities independence

---

## Future Enhancements

### AMM Integration (Phase 2)

PT/YT will be tradable via custom AMM:

```clarity
;; Swap PT for SY at current market rate
(define-public (swap-pt-for-sy (pt-amount uint) (maturity uint) (min-sy-out uint)))

;; Add liquidity to PT/SY pool
(define-public (add-liquidity (pt-amount uint) (sy-amount uint) (maturity uint)))
```

### Oracle-Driven Yield (Phase 2)

Real-time yield updates:

```clarity
;; Oracle callback to update yield accrual rates
(define-public (update-yield-rate (maturity uint) (new-rate uint) (proof buff)))
```

### Governance (Phase 3)

Community-controlled parameters:

```clarity
;; Set minimum maturity period
(define-public (set-min-maturity (blocks uint)))

;; Set yield distribution frequency
(define-public (set-yield-update-frequency (blocks uint)))
```

---

**Version**: 1.0  
**Last Updated**: January 29, 2026  
**Phase**: 1 (Core Contract)
