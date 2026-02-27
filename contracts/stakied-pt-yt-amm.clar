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
    ;; As t->1, price->1:1
    (ok (/ (* sy-reserve precision) pt-reserve))
  )
)

(define-public (initialize-pool (maturity uint) (pt-amount uint) (sy-amount uint))
  (begin
    (asserts! (is-none (map-get? pools maturity)) err-pool-already-exists)
    (asserts! (> pt-amount u0) err-invalid-amount)
    (asserts! (> sy-amount u0) err-invalid-amount)
    ;; Transfer PT from user to AMM
    (try! (contract-call? .stakied-pt-yt-core transfer-pt pt-amount maturity tx-sender (as-contract tx-sender)))
    
    ;; Transfer SY from user to AMM
    (try! (contract-call? .stakied-sy-token transfer sy-amount tx-sender (as-contract tx-sender) none))
    
    ;; Calculate initial LP tokens (geometric mean)
    ;; LP = sqrt(PT * SY)
    (let ((initial-lp (sqrt-i (* pt-amount sy-amount))))
      (begin
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
)

;; Helper: Integer square root (Newton's method) - Unrolled for Clarity
(define-private (sqrt-i (n uint))
  (if (<= n u1)
    n
    (let (
      (x1 (/ (+ u1 n) u2))
      (x2 (/ (+ x1 (/ n x1)) u2))
      (x3 (/ (+ x2 (/ n x2)) u2))
      (x4 (/ (+ x3 (/ n x3)) u2))
      (x5 (/ (+ x4 (/ n x4)) u2))
      (x6 (/ (+ x5 (/ n x5)) u2))
      (x7 (/ (+ x6 (/ n x6)) u2))
      (x8 (/ (+ x7 (/ n x7)) u2))
    )
      (if (<= x8 x7) x8 x7)
    )
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
    (let (
      (pt-after-fee (/ (* pt-amount (- fee-denominator swap-fee-bps)) fee-denominator))
      (sy-out (/ (* sy-reserve pt-after-fee) (+ pt-reserve pt-after-fee)))
    )
      (begin
        (asserts! (>= sy-out min-sy-out) err-slippage-exceeded)
        (asserts! (< sy-out sy-reserve) err-insufficient-liquidity)
        
        ;; Transfer PT from user to pool
        (try! (contract-call? .stakied-pt-yt-core transfer-pt pt-amount maturity tx-sender (as-contract tx-sender)))
        
        ;; Transfer SY from pool to user
        (let ((sender tx-sender))
          (try! (as-contract (contract-call? .stakied-sy-token transfer sy-out tx-sender sender none)))
        )
        
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
)



(define-read-only (quote-swap-pt-for-sy (pt-amount uint) (maturity uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
    (pt-reserve (get pt-reserve pool-data))
    (sy-reserve (get sy-reserve pool-data))
  )
    (asserts! (> pt-amount u0) err-invalid-amount)
    
    (let (
      (pt-after-fee (/ (* pt-amount (- fee-denominator swap-fee-bps)) fee-denominator))
      (sy-out (/ (* sy-reserve pt-after-fee) (+ pt-reserve pt-after-fee)))
    )
      (ok {
        sy-out: sy-out,
        price-impact: (/ (* (- sy-reserve (- sy-reserve sy-out)) precision) sy-reserve),
        fee: (- pt-amount pt-after-fee)
      })
    )
  )
)

(define-read-only (quote-swap-sy-for-pt (sy-amount uint) (maturity uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
    (pt-reserve (get pt-reserve pool-data))
    (sy-reserve (get sy-reserve pool-data))
  )
    (asserts! (> sy-amount u0) err-invalid-amount)
    
    (let (
      (sy-after-fee (/ (* sy-amount (- fee-denominator swap-fee-bps)) fee-denominator))
      (pt-out (/ (* pt-reserve sy-after-fee) (+ sy-reserve sy-after-fee)))
    )
      (ok {
        pt-out: pt-out,
        price-impact: (/ (* (- pt-reserve (- pt-reserve pt-out)) precision) pt-reserve),
        fee: (- sy-amount sy-after-fee)
      })
    )
  )
)

(define-read-only (get-pool-stats (maturity uint))
  (let (
    (pool-data (unwrap! (map-get? pools maturity) err-pool-not-initialized))
  )
    (ok {
      pt-reserve: (get pt-reserve pool-data),
      sy-reserve: (get sy-reserve pool-data),
      total-lp-supply: (get total-lp-supply pool-data),
      last-update: (get last-update pool-data),
      spot-price: (unwrap-panic (get-spot-price maturity)),
      time-to-maturity: (if (> maturity block-height) (- maturity block-height) u0)
    })
  )
)

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
    (let (
      (sy-after-fee (/ (* sy-amount (- fee-denominator swap-fee-bps)) fee-denominator))
      (pt-out (/ (* pt-reserve sy-after-fee) (+ sy-reserve sy-after-fee)))
    )
      (begin
        (asserts! (>= pt-out min-pt-out) err-slippage-exceeded)
        (asserts! (< pt-out pt-reserve) err-insufficient-liquidity)
        
        ;; Transfer SY from user to pool
        (try! (contract-call? .stakied-sy-token transfer sy-amount tx-sender (as-contract tx-sender) none))
        
        ;; Transfer PT from pool to user
        (let ((sender tx-sender))
          (try! (as-contract (contract-call? .stakied-pt-yt-core transfer-pt pt-out maturity tx-sender sender)))
        )
        
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
    
    ;; Calculate LP tokens to mint
    (let (
      (lp-from-pt (/ (* pt-amount total-lp) pt-reserve))
      (lp-from-sy (/ (* sy-amount total-lp) sy-reserve))
      (lp-out (if (< lp-from-pt lp-from-sy) lp-from-pt lp-from-sy))
    )
      (asserts! (>= lp-out min-lp-out) err-slippage-exceeded)
      
      ;; Calculate actual amounts to deposit
      (let (
        (actual-pt (/ (* lp-out pt-reserve) total-lp))
        (actual-sy (/ (* lp-out sy-reserve) total-lp))
      )
        (begin
          ;; Transfer PT from user to pool
          (try! (contract-call? .stakied-pt-yt-core transfer-pt actual-pt maturity tx-sender (as-contract tx-sender)))
          
          ;; Transfer SY from user to pool
          (try! (contract-call? .stakied-sy-token transfer actual-sy tx-sender (as-contract tx-sender) none))
          
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
    (let (
      (pt-out (/ (* lp-amount pt-reserve) total-lp))
      (sy-out (/ (* lp-amount sy-reserve) total-lp))
    )
      (begin
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
        (let ((sender tx-sender))
          (begin
            (try! (as-contract (contract-call? .stakied-pt-yt-core transfer-pt pt-out maturity tx-sender sender)))
            
            ;; Transfer SY to user
            (try! (as-contract (contract-call? .stakied-sy-token transfer sy-out tx-sender sender none)))
          )
        )
        
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
)
