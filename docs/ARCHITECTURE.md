# Stakied Protocol Architecture

## System Design Overview

Stakied is a yield tokenization protocol that allows users to split yield-bearing assets into separate principal and yield components. This design document outlines the architecture, data models, and security considerations.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    User Interface (Phase 3)                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                  Stacks Blockchain                            │
│                                                               │
│  ┌─────────────┐        ┌──────────────┐   ┌──────────────┐ │
│  │  SY Token   │◄───────│ PT/YT Core   │◄──│  PT/YT AMM   │ │
│  │  Contract   │        │  Contract    │   │  Contract    │ │
│  └──────┬──────┘        └──────┬───────┘   └──────────────┘ │
│         │                      │                             │
│         │  ┌───────────────────▼───────────┐                │
│         └──►   SIP-010 Token Trait         │                │
│            └───────────────────────────────┘                │
│                                                               │
│  Phase 2: ✅ AMM with Time-Decay Pricing                     │
│  Future: Oracle, Governance (Phase 3)                        │
└───────────────────────────────────────────────────────────────┘
```

## Contract Architecture

### 1. SY Token Contract

**Purpose**: Wraps yield-bearing assets (stSTX) into a standardized interface

**Key Features**:
- SIP-010 compliant fungible token
- 1:1 wrapping of stSTX
- Exchange rate tracking for yield accrual
- Owner-controlled rate updates

**Data Structures**:

```clarity
;; Token balances
(define-map balances principal uint)

;; Exchange rate (6 decimal precision)
(define-data-var exchange-rate uint u1000000)

;; Last update timestamp
(define-data-var last-yield-update uint u0)

;; Total supply tracking
(define-data-var total-supply uint u0)
```

**State Transitions**:

```
Deposit:  stSTX balance ─[deposit]→ SY balance ↑
Redeem:   SY balance ─[redeem]→ SY balance ↓, stSTX balance ↑
Transfer: SY balance(A) ─[transfer]→ SY balance(A) ↓, SY balance(B) ↑
Rate Update: exchange-rate ─[update]→ new exchange-rate
```

### 2. PT/YT Core Contract

**Purpose**: Manages splitting of SY into PT and YT, handles redemptions

**Key Features**:
- Mints equal amounts of PT and YT for each SY
- Maturity-based redemption logic
- Yield claiming for YT holders
- PT+YT recombination anytime

**Data Structures**:

```clarity
;; PT balances per user per maturity
(define-map pt-balances 
  {user: principal, maturity: uint} 
  uint)

;; YT balances per user per maturity
(define-map yt-balances 
  {user: principal, maturity: uint} 
  uint)

;; Total PT supply per maturity
(define-map pt-total-supply uint uint)

;; Total YT supply per maturity
(define-map yt-total-supply uint uint)

;; Yield claimed per user per maturity
(define-map yt-claimed-yield 
  {user: principal, maturity: uint} 
  uint)
```

**State Machine**:

```
┌─────────────┐
│  User has   │
│  SY tokens  │
└──────┬──────┘
       │
       │ mint-pt-yt(amount, maturity)
       ▼
┌─────────────────────────┐
│  PT balance ↑           │
│  YT balance ↑           │
│  (equal to amount)      │
└──┬───────────┬──────────┘
   │           │
   │           │ claim-yield(maturity)
   │           ▼
   │      ┌──────────────────┐
   │      │ Yield transferred │
   │      │ to user           │
   │      └──────────────────┘
   │
   │ After maturity block
   │ redeem-matured-pt(amount, maturity)
   ▼
┌─────────────────┐
│ PT burned       │
│ SY transferred  │
└─────────────────┘

Alternative path (anytime):
PT + YT ─[redeem-pt-yt]→ Both burned, SY returned
```

### 3. PT/YT AMM Contract (Phase 2)

**Purpose**: Automated Market Maker for trading PT against SY with time-decay pricing

**Key Features**:
- Constant product formula with time-decay modification
- Per-maturity liquidity pools
- LP token system for liquidity providers
- 0.3% swap fee accruing to LPs
- Slippage protection on all operations

**Data Structures**:

```clarity
;; Pool state for each maturity
(define-map pools 
  uint  ;; maturity
  {
    pt-reserve: uint,
    sy-reserve: uint,
    total-lp-supply: uint,
    last-update: uint
  }
)

;; LP token balances
(define-map lp-balances {user: principal, maturity: uint} uint)
```

**AMM State Machine**:

```
┌────────────────┐
│ No pool exists │
│ for maturity M │
└────────┬───────┘
         │
         │ initialize-pool(M, PT, SY)
         ▼
┌─────────────────────────────┐
│ Pool initialized            │
│ - PT reserve = X            │
│ - SY reserve = Y            │
│ - LP supply = sqrt(X*Y)     │
└──┬──────────────────────┬───┘
   │                      │
   │ swap-pt-for-sy       │ add-liquidity
   │                      │
   ▼                      ▼
┌──────────────┐    ┌────────────────┐
│ PT ↑, SY ↓   │    │ PT ↑, SY ↑     │
│ Fee accrued  │    │ LP minted      │
└──────────────┘    └────────────────┘
   │                      │
   │                      │ remove-liquidity
   │                      ▼
   │               ┌────────────────┐
   │               │ PT ↓, SY ↓     │
   │               │ LP burned      │
   │               └────────────────┘
   │
   ▼
Time passes → PT price converges to 1 SY at maturity
```

**Integration with Core Contracts**:

```
User         AMM Contract        PT/YT Core      SY Token
 │                │                  │               │
 │ swap-pt-for-sy │                  │               │
 ├────────────────►                  │               │
 │                │ transfer-pt      │               │
 │                ├──────────────────►               │
 │                │                  │               │
 │                │ transfer SY      │               │
 │                ├──────────────────┼───────────────►
 │                │                  │               │
 │ SY received    │                  │               │
 ◄────────────────┤                  │               │
```

## Data Flow Diagrams

### Minting PT/YT Flow

```
User                     SY Contract            PT/YT Contract
 │                            │                      │
 │  1. deposit(stSTX)         │                      │
 ├────────────────────────────►                      │
 │                            │                      │
 │  2. SY tokens minted       │                      │
 ◄────────────────────────────┤                      │
 │                            │                      │
 │  3. mint-pt-yt(SY, maturity)                     │
 ├────────────────────────────┼──────────────────────►
 │                            │                      │
 │                            │ 4. (Phase 2: Transfer SY)
 │                            ◄──────────────────────┤
 │                            │                      │
 │  5. PT + YT tokens created │                      │
 ◄────────────────────────────┼──────────────────────┤
 │                            │                      │
```

### Redemption Flow

```
User                     PT/YT Contract        SY Contract
 │                            │                      │
 │  1. redeem-matured-pt(PT)  │                      │
 ├────────────────────────────►                      │
 │                            │                      │
 │                            │ 2. Check maturity    │
 │                            │    (block-height >= maturity)
 │                            │                      │
 │                            │ 3. Burn PT tokens    │
 │                            │                      │
 │                            │ 4. (Phase 2: Transfer SY)
 │                            ├──────────────────────►
 │                            │                      │
 │  5. SY tokens received     │                      │
 ◄────────────────────────────┼──────────────────────┤
 │                            │                      │
```

## Security Architecture

### Access Control Matrix

| Function | Caller Restrictions | Validation |
|----------|-------------------|------------|
| `deposit` | Anyone | Amount > 0 |
| `redeem` | Anyone with balance | Amount > 0, balance >= amount |
| `transfer` | Token owner | Amount > 0, balance >= amount |
| `update-exchange-rate` | **Owner only** | Rate > 0 |
| `mint-pt-yt` | Anyone | Amount > 0, maturity > current block |
| `redeem-matured-pt` | Anyone with PT | Amount > 0, current block >= maturity |
| `redeem-pt-yt` | Anyone with both PT+YT | Amount > 0, both balances >= amount |
| `claim-yield` | Anyone with YT | Claimable yield > 0 |

### Invariants

The system maintains these critical invariants:

1. **Conservation of SY**:
   ```
   Total SY minted = Total SY deposited
   Total SY in circulation = Total deposited - Total redeemed
   ```

2. **PT/YT Parity**:
   ```
   For each maturity:
   PT total supply = YT total supply (at minting time)
   ```

3. **Balance Consistency**:
   ```
   Sum of all user balances = Total supply
   (for each token type)
   ```

4. **Maturity Ordering**:
   ```
   All maturities must be in the future: maturity > stacks-block-height
   ```

### Threat Model

| Threat | Mitigation | Status |
|--------|-----------|---------|
| Integer overflow | Clarity's built-in safe math | ✅ Protected |
| Reentrancy | No external calls in Phase 1 | ✅ Protected |
| Unauthorized access | tx-sender checks, owner validation | ✅ Protected |
| Invalid maturity | Block height comparison | ✅ Protected |
| Double claiming yield | Claimed amount tracking | ✅ Protected |
| Insufficient balance | Balance checks before operations | ✅ Protected |

### Known Limitations (Phase 1)

1. **No SY Transfer Integration**: PT/YT contracts don't actually transfer SY tokens yet (marked as Phase 2 TODO)
2. **Simplified Yield Calculation**: Uses placeholder formula (8% APY) instead of real yield data
3. **No Pause Mechanism**: Cannot emergency-stop the protocol
4. **Owner Centralization**: Exchange rate updates controlled by single owner

## Upgrade Path (Phase 2+)

### Integration Enhancements

1. **SY Token Integration**:
   - Implement contract-call pattern for SY transfers
   - Add allowance mechanism for PT/YT contract
   - Test cross-contract calls thoroughly

2. **Oracle Integration**:
   - Connect to Stacks oracle for real yield data
   - Implement time-weighted average calculations
   - Add oracle failure fallback mechanism

3. **AMM Development**:
   - Time-decay bonding curve for PT pricing
   - YT liquidity pools
   - Fee collection and distribution

### Governance Model

```
┌────────────────┐
│ Token Holders  │
│   (Staking)    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   Proposals    │
│  (On-chain)    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│    Voting      │
│  (Timelock)    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Execution     │
│  (Parameters)  │
└────────────────┘
```

## Performance Considerations

### Gas Optimization

Current approach:
- Minimal external calls (Phase 1: none)
- Simple arithmetic operations
- Efficient map lookups

Future optimizations (Phase 2):
- Batch operations for multiple maturities
- Merkle proofs for historical data
- Off-chain indexing for read queries

### Scalability

Current capacity:
- **Maturities**: Unlimited (each maturity is independent)
- **Users per maturity**: Unlimited (map-based storage)
- **Transactions**: Limited by Stacks blockchain throughput

Future improvements:
- Layer 2 scaling solutions
- Optimistic rollups for high-frequency trades
- State channels for P2P PT/YT swaps

## Testing Strategy

### Unit Tests
- ✅ All public functions tested
- ✅ Edge cases covered (zero amounts, insufficient balance)
- ✅ Access control verified
- ✅ Maturity enforcement tested

### Integration Tests
- ⏳ Cross-contract interactions (Phase 2)
- ⏳ Multi-maturity scenarios
- ⏳ Yield calculation accuracy

### Security Audits
- ⏳ Professional audit (Phase 2)
- ⏳ Formal verification (Phase 3)

## Deployment Plan

### Testnet Deployment
1. Deploy SIP-010 trait
2. Deploy SY token
3. Deploy PT/YT core
4. Test all functions manually
5. Monitor for 1 week

### Mainnet Deployment
1. Professional security audit
2. Bug bounty program
3. Gradual rollout with TVL caps
4. Monitoring and incident response plan

---

**Document Version**: 1.0  
**Last Updated**: January 29, 2026  
**Phase**: 1 (Core Contracts)
