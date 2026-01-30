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

(define-public (initialize-pool (maturity uint) (pt-amount uint) (sy-amount uint))
  (begin
    (asserts! (is-none (map-get? pools maturity)) err-pool-already-exists)
    (asserts! (> pt-amount u0) err-invalid-amount)
    (asserts! (> sy-amount u0) err-invalid-amount)
    (asserts! (> maturity block-height) err-invalid-maturity)
    
    ;; Transfer PT from user to AMM
    (try! (contract-call? .pt-yt-core transfer-pt pt-amount maturity tx-sender (as-contract tx-sender)))
    
    ;; Transfer SY from user to AMM
    (try! (contract-call? .sy-token transfer sy-amount tx-sender (as-contract tx-sender) none))
    
    ;; Calculate initial LP tokens (geometric mean)
    ;; LP = sqrt(PT * SY)
    (let ((initial-lp (sqrti (* pt-amount sy-amount))))
      (map-set pools maturity {
        pt-reserve: pt-amount,
        sy-reserve: sy-amount,
        total-lp-supply: initial-lp,
        last-update: block-height
      })
      
      (map-set lp-balances {user: tx-sender, maturity: maturity} initial-lp)
      
      (print {
        action: "initialize-pool",
        maturity: maturity,
        pt-amount: pt-amount,
        sy-amount: sy-amount,
        lp-tokens: initial-lp
      })
      
      (ok initial-lp)
    )
  )
)

;; Helper: Integer square root (Newton's method)
(define-private (sqrti (n uint))
  (if (<= n u1)
    n
    (let ((x0 (/ n u2)))
      (sqrti-iter n x0 (/ (+ x0 (/ n x0)) u2))
    )
  )
)

(define-private (sqrti-iter (n uint) (x0 uint) (x1 uint))
  (if (>= x1 x0)
    x0
    (sqrti-iter n x1 (/ (+ x1 (/ n x1)) u2))
  )
)

(define-public (swap-pt-for-sy (pt-amount uint) (maturity uint) (min-sy-out uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
    (pt-reserve (get pt-reserve pool-data))
    (sy-reserve (get sy-reserve pool-data))
  )
    (asserts! (> pt-amount u0) err-invalid-amount)
    (asserts! (> pt-reserve u0) err-zero-reserves)
    (asserts! (> sy-reserve u0) err-zero-reserves)
    
    ;; Calculate swap output using constant product formula
    ;; sy_out = (sy_reserve * pt_amount) / (pt_reserve + pt_amount)
    ;; Apply fee: pt_after_fee = pt_amount * (10000 - 30) / 10000
    (let (
      (pt-after-fee (/ (* pt-amount (- fee-denominator swap-fee-bps)) fee-denominator))
      (sy-out (/ (* sy-reserve pt-after-fee) (+ pt-reserve pt-after-fee)))
    )
      (asserts! (>= sy-out min-sy-out) err-slippage-exceeded)
      (asserts! (< sy-out sy-reserve) err-insufficient-liquidity)
      
      ;; Transfer PT from user to pool
      (try! (contract-call? .pt-yt-core transfer-pt pt-amount maturity tx-sender (as-contract tx-sender)))
      
      ;; Transfer SY from pool to user
      (try! (as-contract (contract-call? .sy-token transfer sy-out tx-sender (unwrap-panic (get-sender)) none)))
      
      ;; Update pool reserves
      (map-set pools maturity {
        pt-reserve: (+ pt-reserve pt-amount),
        sy-reserve: (- sy-reserve sy-out),
        total-lp-supply: (get total-lp-supply pool-data),
        last-update: block-height
      })
      
      (print {
        action: "swap-pt-for-sy",
        pt-in: pt-amount,
        sy-out: sy-out,
        maturity: maturity
      })
      
      (ok sy-out)
    )
  )
)

(define-private (get-sender)
  (ok tx-sender))

(define-public (swap-sy-for-pt (sy-amount uint) (maturity uint) (min-pt-out uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
    (pt-reserve (get pt-reserve pool-data))
    (sy-reserve (get sy-reserve pool-data))
  )
    (asserts! (> sy-amount u0) err-invalid-amount)
    (asserts! (> pt-reserve u0) err-zero-reserves)
    (asserts! (> sy-reserve u0) err-zero-reserves)
    
    ;; Calculate swap output
    ;; pt_out = (pt_reserve * sy_amount) / (sy_reserve + sy_amount)
    ;; Apply fee
    (let (
      (sy-after-fee (/ (* sy-amount (- fee-denominator swap-fee-bps)) fee-denominator))
      (pt-out (/ (* pt-reserve sy-after-fee) (+ sy-reserve sy-after-fee)))
    )
      (asserts! (>= pt-out min-pt-out) err-slippage-exceeded)
      (asserts! (< pt-out pt-reserve) err-insufficient-liquidity)
      
      ;; Transfer SY from user to pool
      (try! (contract-call? .sy-token transfer sy-amount tx-sender (as-contract tx-sender) none))
      
      ;; Transfer PT from pool to user
      (try! (as-contract (contract-call? .pt-yt-core transfer-pt pt-out maturity tx-sender (unwrap-panic (get-sender)))))
      
      ;; Update pool reserves
      (map-set pools maturity {
        pt-reserve: (- pt-reserve pt-out),
        sy-reserve: (+ sy-reserve sy-amount),
        total-lp-supply: (get total-lp-supply pool-data),
        last-update: block-height
      })
      
      (print {
        action: "swap-sy-for-pt",
        sy-in: sy-amount,
        pt-out: pt-out,
        maturity: maturity
      })
      
      (ok pt-out)
    )
  )
)

(define-public (add-liquidity (maturity uint) (pt-amount uint) (sy-amount uint) (min-lp-out uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
    (pt-reserve (get pt-reserve pool-data))
    (sy-reserve (get sy-reserve pool-data))
    (total-lp (get total-lp-supply pool-data))
  )
    (asserts! (> pt-amount u0) err-invalid-amount)
    (asserts! (> sy-amount u0) err-invalid-amount)
    
    ;; Calculate LP tokens to mint (proportional to liquidity added)
    ;; lp_out = min((pt_amount * total_lp / pt_reserve), (sy_amount * total_lp / sy_reserve))
    (let (
      (lp-from-pt (/ (* pt-amount total-lp) pt-reserve))
      (lp-from-sy (/ (* sy-amount total-lp) sy-reserve))
      (lp-out (if (< lp-from-pt lp-from-sy) lp-from-pt lp-from-sy))
    )
      (asserts! (>= lp-out min-lp-out) err-slippage-exceeded)
      
      ;; Calculate actual amounts to deposit (may be less than specified to maintain ratio)
      (let (
        (actual-pt (/ (* lp-out pt-reserve) total-lp))
        (actual-sy (/ (* lp-out sy-reserve) total-lp))
      )
        ;; Transfer PT from user to pool
        (try! (contract-call? .pt-yt-core transfer-pt actual-pt maturity tx-sender (as-contract tx-sender)))
        
        ;; Transfer SY from user to pool
        (try! (contract-call? .sy-token transfer actual-sy tx-sender (as-contract tx-sender) none))
        
        ;; Update pool state
        (map-set pools maturity {
          pt-reserve: (+ pt-reserve actual-pt),
          sy-reserve: (+ sy-reserve actual-sy),
          total-lp-supply: (+ total-lp lp-out),
          last-update: block-height
        })
        
        ;; Mint LP tokens to user
        (let ((current-lp (default-to u0 (map-get? lp-balances {user: tx-sender, maturity: maturity}))))
          (map-set lp-balances {user: tx-sender, maturity: maturity} (+ current-lp lp-out))
        )
        
        (print {
          action: "add-liquidity",
          pt-added: actual-pt,
          sy-added: actual-sy,
          lp-minted: lp-out,
          maturity: maturity
        })
        
        (ok {pt: actual-pt, sy: actual-sy, lp: lp-out})
      )
    )
  )
)

(define-public (remove-liquidity (maturity uint) (lp-amount uint) (min-pt-out uint) (min-sy-out uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
    (pt-reserve (get pt-reserve pool-data))
    (sy-reserve (get sy-reserve pool-data))
    (total-lp (get total-lp-supply pool-data))
    (user-lp (default-to u0 (map-get? lp-balances {user: tx-sender, maturity: maturity})))
  )
    (asserts! (> lp-amount u0) err-invalid-amount)
    (asserts! (>= user-lp lp-amount) err-insufficient-balance)
    
    ;; Calculate amounts to return
    ;; pt_out = (lp_amount * pt_reserve) / total_lp
    ;; sy_out = (lp_amount * sy_reserve) / total_lp
    (let (
      (pt-out (/ (* lp-amount pt-reserve) total-lp))
      (sy-out (/ (* lp-amount sy-reserve) total-lp))
    )
      (asserts! (>= pt-out min-pt-out) err-slippage-exceeded)
      (asserts! (>= sy-out min-sy-out) err-slippage-exceeded)
      
      ;; Burn LP tokens
      (map-set lp-balances {user: tx-sender, maturity: maturity} (- user-lp lp-amount))
      
      ;; Update pool reserves
      (map-set pools maturity {
        pt-reserve: (- pt-reserve pt-out),
        sy-reserve: (- sy-reserve sy-out),
        total-lp-supply: (- total-lp lp-amount),
        last-update: block-height
      })
      
      ;; Transfer PT to user
      (try! (as-contract (contract-call? .pt-yt-core transfer-pt pt-out maturity tx-sender (unwrap-panic (get-sender)))))
      
      ;; Transfer SY to user
      (try! (as-contract (contract-call? .sy-token transfer sy-out tx-sender (unwrap-panic (get-sender)) none)))
      
      (print {
        action: "remove-liquidity",
        lp-burned: lp-amount,
        pt-returned: pt-out,
        sy-returned: sy-out,
        maturity: maturity
      })
      
      (ok {pt: pt-out, sy: sy-out})
    )
  )
)
