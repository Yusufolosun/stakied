;; Stakied PT/YT AMM - Automated Market Maker with Time-Decay Curve
;; Enables trading of Principal Tokens (PT) against SY tokens

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u300))
(define-constant err-not-authorized (err u301))
(define-constant err-invalid-amount (err u302))
(define-constant err-insufficient-balance (err u303))
(define-constant err-insufficient-liquidity (err u304))
(define-constant err-slippage-exceeded (err u305))
(define-constant err-pool-not-initialized (err u306))
(define-constant err-pool-already-exists (err u307))
(define-constant err-zero-reserves (err u308))
(define-constant err-invalid-maturity (err u309))

;; Fee configuration (in basis points: 30 = 0.3%)
(define-constant swap-fee-bps u30)
(define-constant fee-denominator u10000)
(define-constant precision u1000000)

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

;; Read-only functions
(define-read-only (get-pool (maturity uint))
  (ok (map-get? pools maturity)))

(define-read-only (get-lp-balance (user principal) (maturity uint))
  (ok (default-to u0 (map-get? lp-balances {user: user, maturity: maturity}))))

(define-read-only (get-pool-reserves (maturity uint))
  (let ((pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized)))
    (ok {
      pt-reserve: (get pt-reserve pool-data),
      sy-reserve: (get sy-reserve pool-data)
    })
  )
)

(define-read-only (calculate-time-factor (maturity uint))
  (if (>= block-height maturity)
    precision  ;; t = 1 (maturity reached, PT = 1 SY)
    (let (
      (blocks-to-maturity (- maturity block-height))
      (total-blocks maturity)
    )
      ;; t = (current_block) / (maturity_block)
      ;; Return as fixed-point with 6 decimals
      (if (is-eq total-blocks u0)
        u0
        (/ (* (- maturity blocks-to-maturity) precision) total-blocks)
      )
    )
  )
)

(define-read-only (get-spot-price (maturity uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
    (pt-reserve (get pt-reserve pool-data))
    (sy-reserve (get sy-reserve pool-data))
    (time-factor (calculate-time-factor maturity))
  )
    (asserts! (> pt-reserve u0) err-zero-reserves)
    (asserts! (> sy-reserve u0) err-zero-reserves)
    
    ;; Simplified spot price: (SY_reserve / PT_reserve) * precision
    ;; As t→1, price→1:1
    (ok (/ (* sy-reserve precision) pt-reserve))
  )
)
