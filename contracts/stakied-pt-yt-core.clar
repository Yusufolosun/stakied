;; Stakied PT/YT Core - Principal & Yield Token Minting/Redemption

;; Constants
;; Governance
(define-data-var contract-owner principal tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-authorized (err u201))
(define-constant err-invalid-amount (err u202))
(define-constant err-insufficient-balance (err u203))
(define-constant err-maturity-not-reached (err u204))
(define-constant err-already-matured (err u205))
(define-constant err-invalid-maturity (err u206))
(define-constant err-paused (err u207))

;; Data variables
(define-data-var is-paused bool false)
(define-data-var sy-contract principal contract-owner)

;; PT (Principal Token) data
(define-map pt-balances {user: principal, maturity: uint} uint)
(define-map pt-total-supply uint uint)

;; YT (Yield Token) data
(define-map yt-balances {user: principal, maturity: uint} uint)
(define-map yt-total-supply uint uint)
(define-map yt-claimed-yield {user: principal, maturity: uint} uint)

;; Read-only functions
(define-read-only (get-pt-balance (user principal) (maturity uint))
  (ok (default-to u0 (map-get? pt-balances {user: user, maturity: maturity}))))

(define-read-only (get-yt-balance (user principal) (maturity uint))
  (ok (default-to u0 (map-get? yt-balances {user: user, maturity: maturity}))))

(define-read-only (get-pt-total-supply (maturity uint))
  (ok (default-to u0 (map-get? pt-total-supply maturity))))

(define-read-only (get-yt-total-supply (maturity uint))
  (ok (default-to u0 (map-get? yt-total-supply maturity))))

(define-public (mint-pt-yt (sy-amount uint) (maturity uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> sy-amount u0) err-invalid-amount)
    (asserts! (> maturity block-height) err-invalid-maturity)
    
    ;; Mint PT tokens
    (let ((current-pt-balance (default-to u0 (map-get? pt-balances {user: tx-sender, maturity: maturity}))))
      (map-set pt-balances {user: tx-sender, maturity: maturity} (+ current-pt-balance sy-amount))
      (map-set pt-total-supply maturity (+ (default-to u0 (map-get? pt-total-supply maturity)) sy-amount))
    )
    
    ;; Mint YT tokens (same amount as PT)
    (let ((current-yt-balance (default-to u0 (map-get? yt-balances {user: tx-sender, maturity: maturity}))))
      (map-set yt-balances {user: tx-sender, maturity: maturity} (+ current-yt-balance sy-amount))
      (map-set yt-total-supply maturity (+ (default-to u0 (map-get? yt-total-supply maturity)) sy-amount))
    )
    
    (print {
      event: "mint-pt-yt",
      user: tx-sender,
      amount: sy-amount,
      maturity: maturity,
      contract: (as-contract tx-sender)
    })
    (ok {pt-minted: sy-amount, yt-minted: sy-amount, maturity: maturity})
  )
)

(define-public (redeem-matured-pt (pt-amount uint) (maturity uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> pt-amount u0) err-invalid-amount)
    (asserts! (>= block-height maturity) err-maturity-not-reached)
    
    (let ((user-pt-balance (default-to u0 (map-get? pt-balances {user: tx-sender, maturity: maturity}))))
      (asserts! (>= user-pt-balance pt-amount) err-insufficient-balance)
      
      ;; Burn PT tokens
      (map-set pt-balances {user: tx-sender, maturity: maturity} (- user-pt-balance pt-amount))
      (map-set pt-total-supply maturity (- (default-to u0 (map-get? pt-total-supply maturity)) pt-amount))
      
      (print {
        event: "redeem-pt",
        user: tx-sender,
        amount: pt-amount,
        maturity: maturity,
        contract: (as-contract tx-sender)
      })
      (ok {amount: pt-amount, maturity: maturity})
    )
  )
)

(define-public (redeem-pt-yt (amount uint) (maturity uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> amount u0) err-invalid-amount)
    
    (let (
      (user-pt-balance (default-to u0 (map-get? pt-balances {user: tx-sender, maturity: maturity})))
      (user-yt-balance (default-to u0 (map-get? yt-balances {user: tx-sender, maturity: maturity})))
    )
      (asserts! (>= user-pt-balance amount) err-insufficient-balance)
      (asserts! (>= user-yt-balance amount) err-insufficient-balance)
      
      ;; Burn PT tokens
      (map-set pt-balances {user: tx-sender, maturity: maturity} (- user-pt-balance amount))
      (map-set pt-total-supply maturity (- (default-to u0 (map-get? pt-total-supply maturity)) amount))
      
      ;; Burn YT tokens
      (map-set yt-balances {user: tx-sender, maturity: maturity} (- user-yt-balance amount))
      (map-set yt-total-supply maturity (- (default-to u0 (map-get? yt-total-supply maturity)) amount))
      
      (print {
        event: "redeem-pt-yt",
        user: tx-sender,
        amount: amount,
        maturity: maturity,
        contract: (as-contract tx-sender)
      })
      (ok {amount: amount, maturity: maturity})
    )
  )
)

(define-read-only (calculate-claimable-yield (user principal) (maturity uint))
  (let (
    (user-yt-balance (default-to u0 (map-get? yt-balances {user: user, maturity: maturity})))
    (total-yt-supply (default-to u1 (map-get? yt-total-supply maturity)))
    (already-claimed (default-to u0 (map-get? yt-claimed-yield {user: user, maturity: maturity})))
  )
    ;; Simplified: assume 8% APY prorata distribution
    (let ((total-yield (* user-yt-balance u8)))
      (ok (if (> total-yield already-claimed)
            (- total-yield already-claimed)
            u0))
    )
  )
)

(define-public (claim-yield (maturity uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (let (
      (claimable (unwrap! (calculate-claimable-yield tx-sender maturity) err-invalid-amount))
    )
    (asserts! (> claimable u0) err-invalid-amount)
    
    ;; Update claimed amount
    (let ((already-claimed (default-to u0 (map-get? yt-claimed-yield {user: tx-sender, maturity: maturity}))))
      (map-set yt-claimed-yield {user: tx-sender, maturity: maturity} (+ already-claimed claimable))
    )
    
    (print {
      event: "claim-yield",
      user: tx-sender,
      amount: claimable,
      maturity: maturity,
      contract: (as-contract tx-sender)
    })
    (ok {amount: claimable, maturity: maturity})
  )
)

(define-public (transfer-pt (amount uint) (maturity uint) (sender principal) (recipient principal))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    
    (let ((sender-balance (default-to u0 (map-get? pt-balances {user: sender, maturity: maturity}))))
      (asserts! (>= sender-balance amount) err-insufficient-balance)
      
      (map-set pt-balances {user: sender, maturity: maturity} (- sender-balance amount))
      (map-set pt-balances {user: recipient, maturity: maturity} 
        (+ (default-to u0 (map-get? pt-balances {user: recipient, maturity: maturity})) amount))
      
      (print {
        event: "transfer-pt",
        sender: sender,
        recipient: recipient,
        amount: amount,
        maturity: maturity,
        contract: (as-contract tx-sender)
      })
      (ok {sender: sender, recipient: recipient, amount: amount, maturity: maturity})
    )
  )
)

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set contract-owner new-owner)
    (ok true)
  )
)

(define-public (set-paused (new-paused bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set is-paused new-paused)
    (ok true)
  )
)
