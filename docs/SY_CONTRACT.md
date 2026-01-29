# SY Token Contract API Documentation

## Overview

The SY (Standardized Yield) Token contract wraps yield-bearing assets (stSTX) into a standardized SIP-010 compliant token. This provides a consistent interface for the PT/YT minting engine.

**Contract**: `sy-token.clar`  
**Standard**: SIP-010 Fungible Token  
**Decimals**: 6

## Public Functions

### deposit

Deposits stSTX and mints SY tokens at a 1:1 ratio.

**Signature**:
```clarity
(define-public (deposit (amount uint)) (response uint uint))
```

**Parameters**:
- `amount` (uint): Amount of stSTX to deposit (in microSTX, 6 decimals)

**Returns**:
- `(ok uint)`: Amount of SY tokens minted
- `(err u102)`: Invalid amount (zero or negative)

**Example**:
```clarity
(contract-call? .sy-token deposit u1000000) ;; Deposit 1 STX worth
;; Returns: (ok u1000000)
```

**Events Emitted**:
```clarity
{action: "deposit", user: principal, amount: uint}
```

---

### redeem

Burns SY tokens and returns stSTX at a 1:1 ratio.

**Signature**:
```clarity
(define-public (redeem (amount uint)) (response uint uint))
```

**Parameters**:
- `amount` (uint): Amount of SY tokens to burn

**Returns**:
- `(ok uint)`: Amount of stSTX returned
- `(err u102)`: Invalid amount (zero)
- `(err u103)`: Insufficient SY balance

**Example**:
```clarity
(contract-call? .sy-token redeem u500000) ;; Redeem 0.5 STX worth
;; Returns: (ok u500000)
```

**Events Emitted**:
```clarity
{action: "redeem", user: principal, amount: uint}
```

---

### transfer

SIP-010 compliant transfer function.

**Signature**:
```clarity
(define-public (transfer 
  (amount uint) 
  (sender principal) 
  (recipient principal) 
  (memo (optional (buff 34))))
  (response bool uint))
```

**Parameters**:
- `amount` (uint): Amount to transfer
- `sender` (principal): Sender address (must be tx-sender)
- `recipient` (principal): Recipient address
- `memo` (optional buff): Optional transfer memo

**Returns**:
- `(ok true)`: Transfer successful
- `(err u101)`: Not authorized (tx-sender != sender)
- `(err u102)`: Invalid amount (zero)
- `(err u103)`: Insufficient balance

**Example**:
```clarity
(contract-call? .sy-token transfer 
  u1000000 
  tx-sender 
  'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 
  none)
;; Returns: (ok true)
```

**Events Emitted**:
```clarity
{
  action: "transfer", 
  sender: principal, 
  recipient: principal, 
  amount: uint, 
  memo: (optional buff)
}
```

---

### update-exchange-rate

Updates the exchange rate to reflect yield accrual. **Owner-only function.**

**Signature**:
```clarity
(define-public (update-exchange-rate (new-rate uint)) (response bool uint))
```

**Parameters**:
- `new-rate` (uint): New exchange rate (6 decimal precision, e.g., 1050000 = 1.05x)

**Returns**:
- `(ok true)`: Update successful
- `(err u100)`: Not authorized (caller is not owner)
- `(err u102)`: Invalid rate (zero)

**Example**:
```clarity
;; Owner increasing rate to 1.05 (5% yield accrued)
(contract-call? .sy-token update-exchange-rate u1050000)
;; Returns: (ok true)
```

**Access Control**: Contract owner only  
**Side Effects**: Updates `last-yield-update` to current block height

---

## Read-Only Functions

### get-name

Returns the token name.

**Signature**:
```clarity
(define-read-only (get-name) (response (string-ascii 32) uint))
```

**Returns**:
```clarity
(ok "Stakied Standardized Yield")
```

---

### get-symbol

Returns the token symbol.

**Signature**:
```clarity
(define-read-only (get-symbol) (response (string-ascii 32) uint))
```

**Returns**:
```clarity
(ok "SY-stSTX")
```

---

### get-decimals

Returns the token decimals.

**Signature**:
```clarity
(define-read-only (get-decimals) (response uint uint))
```

**Returns**:
```clarity
(ok u6)
```

---

### get-balance

Returns the SY token balance for an account.

**Signature**:
```clarity
(define-read-only (get-balance (account principal)) (response uint uint))
```

**Parameters**:
- `account` (principal): Address to query

**Returns**:
```clarity
(ok uint) ;; Balance (0 if account has no tokens)
```

**Example**:
```clarity
(contract-call? .sy-token get-balance 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
;; Returns: (ok u1000000)
```

---

### get-total-supply

Returns the total SY token supply.

**Signature**:
```clarity
(define-read-only (get-total-supply) (response uint uint))
```

**Returns**:
```clarity
(ok uint) ;; Total supply
```

---

### get-token-uri

Returns the token metadata URI (currently none).

**Signature**:
```clarity
(define-read-only (get-token-uri) (response (optional (string-utf8 256)) uint))
```

**Returns**:
```clarity
(ok none)
```

---

### get-exchange-rate

Returns the current exchange rate for SY:stSTX.

**Signature**:
```clarity
(define-read-only (get-exchange-rate) (response uint uint))
```

**Returns**:
```clarity
(ok uint) ;; Exchange rate (6 decimal precision)
```

**Example**:
```clarity
(contract-call? .sy-token get-exchange-rate)
;; Returns: (ok u1000000) ;; 1.0 = 1:1 ratio
```

---

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| u100 | `err-owner-only` | Function can only be called by contract owner |
| u101 | `err-not-authorized` | Caller not authorized for this action |
| u102 | `err-invalid-amount` | Amount is zero or invalid |
| u103 | `err-insufficient-balance` | User has insufficient token balance |
| u104 | `err-transfer-failed` | Transfer operation failed (unused in Phase 1) |

---

## Usage Patterns

### Basic Deposit/Redeem Flow

```clarity
;; 1. Deposit stSTX to get SY
(contract-call? .sy-token deposit u5000000)

;; 2. Check balance
(contract-call? .sy-token get-balance tx-sender)
;; => (ok u5000000)

;; 3. Redeem half
(contract-call? .sy-token redeem u2500000)

;; 4. Final balance
(contract-call? .sy-token get-balance tx-sender)
;; => (ok u2500000)
```

### Transfer to Another User

```clarity
;; Transfer 1 STX worth of SY
(contract-call? .sy-token transfer 
  u1000000 
  tx-sender 
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 
  (some 0x48656c6c6f)) ;; "Hello" in hex
```

### Monitoring Yield Accrual

```clarity
;; Initial rate
(contract-call? .sy-token get-exchange-rate)
;; => (ok u1000000) ;; 1.0

;; After yield accrues (owner updates)
(contract-call? .sy-token get-exchange-rate)
;; => (ok u1080000) ;; 1.08 (8% yield)
```

---

## Integration Notes

### For PT/YT Contract Integration (Phase 2)

To enable PT/YT contracts to hold and transfer SY tokens:

1. Implement allowance mechanism (currently stub):
```clarity
(define-map allowances {owner: principal, spender: principal} uint)
```

2. Add approve function:
```clarity
(define-public (approve (spender principal) (amount uint)))
```

3. Update transfer to support delegated transfers:
```clarity
(define-public (transfer-from (amount uint) (owner principal) (recipient principal)))
```

### For Oracle Integration (Phase 2)

Exchange rate updates should be automated via oracle:

```clarity
;; Oracle callback
(define-public (oracle-update-rate (new-rate uint) (signature buff))
  (begin
    ;; Verify oracle signature
    (asserts! (verify-oracle-signature new-rate signature) err-invalid-signature)
    ;; Update rate
    (var-set exchange-rate new-rate)
    (ok true)
  ))
```

---

## Security Considerations

### Access Control
- ✅ Only owner can update exchange rates
- ✅ Users can only transfer their own tokens
- ✅ All state changes require explicit authorization

### Validation
- ✅ Zero amounts rejected
- ✅ Balance checks before transfers
- ✅ Overflow protection via Clarity's safe math

### Known Limitations
- ⚠️ No pause mechanism
- ⚠️ Centralized exchange rate updates (owner-only)
- ⚠️ No allowance/approval system yet

---

## Testing

See [tests/sy-token.test.ts](../tests/sy-token.test.ts) for comprehensive test coverage including:
- ✅ Deposit/redeem flows
- ✅ Transfer validation
- ✅ Exchange rate updates
- ✅ Access control
- ✅ Edge cases (zero amounts, insufficient balance)

---

**Version**: 1.0  
**Last Updated**: January 29, 2026  
**Phase**: 1 (Core Contract)
