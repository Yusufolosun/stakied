;; Stakied SY Token - Standardized Yield Wrapper
;; Wraps stSTX (liquid staked STX) into standardized yield-bearing token

(impl-trait .stakied-sip-010-trait.stakied-sip-010-trait)

;; Constants
;; Governance
(define-data-var contract-owner principal tx-sender)
;; Error Constants (Unified Schema)
(define-constant err-owner-only (err u1))          ;; Unauthorized owner action
(define-constant err-not-authorized (err u2))      ;; Action not allowed for caller
(define-constant err-paused (err u3))              ;; Contract is currently paused
(define-constant err-invalid-amount (err u4))      ;; Provided amount is zero or invalid
(define-constant err-insufficient-balance (err u5)) ;; User balance below required amount
(define-constant err-transfer-failed (err u100))   ;; SIP-010 transfer did not succeed

;; Token metadata
(define-constant token-name "Stakied Standardized Yield")
(define-constant token-symbol "SY-stSTX")
(define-constant token-decimals u6)

;; Data variables
(define-data-var is-paused bool false)
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var total-supply uint u0)
(define-data-var exchange-rate uint u1000000) ;; 1:1 initially (6 decimals)
(define-data-var last-yield-update uint u0)

;; Data maps
(define-map balances principal uint)
(define-map allowances {owner: principal, spender: principal} uint)

;; Read-only functions for SIP-010 compliance
(define-read-only (get-name)
  (ok token-name))

(define-read-only (get-symbol)
  (ok token-symbol))

(define-read-only (get-decimals)
  (ok token-decimals))

(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? balances account))))

(define-read-only (get-total-supply)
  (ok (var-get total-supply)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-read-only (get-exchange-rate)
  (ok (var-get exchange-rate)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    
    (let ((sender-balance (default-to u0 (map-get? balances sender))))
      (asserts! (>= sender-balance amount) err-insufficient-balance)
      
      (map-set balances sender (- sender-balance amount))
      (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
      
      (print {
        event: "transfer",
        sender: sender,
        recipient: recipient,
        amount: amount,
        memo: memo,
        contract: (as-contract tx-sender)
      })
      (ok true)
    )
  )
)

(define-public (deposit (amount uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> amount u0) err-invalid-amount)
    
    (let ((current-balance (default-to u0 (map-get? balances tx-sender))))
      (map-set balances tx-sender (+ current-balance amount))
      (var-set total-supply (+ (var-get total-supply) amount))
      
      (print {
        event: "deposit",
        user: tx-sender,
        amount: amount,
        contract: (as-contract tx-sender)
      })
      (ok {user: tx-sender, amount: amount})
    )
  )
)

(define-public (redeem (amount uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> amount u0) err-invalid-amount)
    
    (let ((current-balance (default-to u0 (map-get? balances tx-sender))))
      (asserts! (>= current-balance amount) err-insufficient-balance)
      
      (map-set balances tx-sender (- current-balance amount))
      (var-set total-supply (- (var-get total-supply) amount))
      
      (print {
        event: "redeem",
        user: tx-sender,
        amount: amount,
        contract: (as-contract tx-sender)
      })
      (ok {user: tx-sender, amount: amount})
    )
  )
)

(define-public (update-exchange-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (asserts! (> new-rate u0) err-invalid-amount)
    (var-set exchange-rate new-rate)
    (var-set last-yield-update block-height)
    (print {
      event: "update-exchange-rate",
      new-rate: new-rate,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {new-rate: new-rate})
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
