;; Stakied Fee Vault - Protocol fee collection and distribution
;; Collects trading/redemption fees and distributes to treasury or stakers

;; Constants
;; Governance
(define-data-var contract-owner principal tx-sender)
;; Error Constants (Unified Schema)
(define-constant err-owner-only (err u1))          ;; Unauthorized owner action
(define-constant err-not-authorized (err u2))      ;; Action not allowed for caller
(define-constant err-paused (err u3))              ;; Contract is currently paused
(define-constant err-invalid-amount (err u4))      ;; Provided amount is zero or invalid
(define-constant err-insufficient-balance (err u5)) ;; User balance below required amount
(define-constant err-invalid-recipient (err u500))  ;; Recipient address is invalid or not set
(define-constant err-invalid-split (err u501))      ;; Fee split percentages do not add up
(define-constant err-no-fees (err u502))            ;; No fees available for distribution
(define-constant err-cooldown-active (err u503))    ;; Must wait before next distribution
(define-constant err-zero-address (err u504))       ;; Principal cannot be the zero address

;; Fee split: basis points out of 10000
(define-constant bps-denominator u10000)

;; Data variables
(define-data-var total-fees-collected uint u0)
(define-data-var total-fees-distributed uint u0)
(define-data-var treasury-address principal tx-sender)
(define-data-var treasury-split-bps uint u5000) ;; 50% to treasury
(define-data-var staker-split-bps uint u5000)   ;; 50% to stakers
(define-data-var is-paused bool false)
(define-data-var last-distribution-block uint u0)
(define-data-var distribution-cooldown uint u144) ;; ~1 day between distributions

;; Data maps
(define-map fee-balances principal uint) ;; per-source fee tracking
(define-map authorized-collectors principal bool)

;; Read-only functions
(define-read-only (get-vault-balance)
  (ok (- (var-get total-fees-collected) (var-get total-fees-distributed))))

(define-read-only (get-fee-config)
  (ok {
    treasury-address: (var-get treasury-address),
    treasury-split-bps: (var-get treasury-split-bps),
    staker-split-bps: (var-get staker-split-bps),
    distribution-cooldown: (var-get distribution-cooldown),
    is-paused: (var-get is-paused)
  }))

(define-read-only (get-fee-stats)
  (ok {
    total-collected: (var-get total-fees-collected),
    total-distributed: (var-get total-fees-distributed),
    pending: (- (var-get total-fees-collected) (var-get total-fees-distributed)),
    last-distribution: (var-get last-distribution-block)
  }))

(define-read-only (is-authorized-collector (collector principal))
  (ok (default-to false (map-get? authorized-collectors collector))))

;; Public functions
(define-public (collect-fee (amount uint) (source principal))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (or (is-eq tx-sender (var-get contract-owner))
                  (default-to false (map-get? authorized-collectors tx-sender)))
              err-not-authorized)

    ;; Track fee by source
    (map-set fee-balances source
      (+ (default-to u0 (map-get? fee-balances source)) amount))
    
    (var-set total-fees-collected (+ (var-get total-fees-collected) amount))

    (print {
      event: "collect-fee",
      collector: tx-sender,
      source: source,
      amount: amount,
      contract: (as-contract tx-sender)
    })
    (ok {source: source, amount: amount})
  )
)

(define-public (distribute-fees)
  (let (
    (pending (- (var-get total-fees-collected) (var-get total-fees-distributed)))
    (last-dist (var-get last-distribution-block))
    (cooldown (var-get distribution-cooldown))
  )
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> pending u0) err-no-fees)
    (asserts! (>= block-height (+ last-dist cooldown)) err-cooldown-active)

    (let (
      (treasury-share (/ (* pending (var-get treasury-split-bps)) bps-denominator))
      (staker-share (- pending treasury-share))
    )
      (var-set last-distribution-block block-height)

      (print {
        event: "distribute-fees",
        total: pending,
        treasury-share: treasury-share,
        staker-share: staker-share,
        block: block-height,
        contract: (as-contract tx-sender)
      })
      (ok {treasury: treasury-share, stakers: staker-share})
    )
  )
)

(define-public (set-fee-recipient (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set treasury-address new-treasury)
    (print {
      event: "set-fee-recipient",
      new-treasury: new-treasury,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {new-treasury: new-treasury})
  )
)

(define-public (set-fee-split (new-treasury-bps uint) (new-staker-bps uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (asserts! (is-eq (+ new-treasury-bps new-staker-bps) bps-denominator) err-invalid-split)
    (var-set treasury-split-bps new-treasury-bps)
    (var-set staker-split-bps new-staker-bps)
    (print {
      event: "set-fee-split",
      treasury-bps: new-treasury-bps,
      staker-bps: new-staker-bps,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {treasury-bps: new-treasury-bps, staker-bps: new-staker-bps})
  )
)

(define-public (authorize-collector (collector principal) (authorized bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (map-set authorized-collectors collector authorized)
    (print {
      event: "authorize-collector",
      collector: collector,
      authorized: authorized,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {collector: collector, authorized: authorized})
  )
)

(define-public (set-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set is-paused paused)
    (print {
      event: "set-paused",
      paused: paused,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {paused: paused})
  )
)

(define-public (set-distribution-cooldown (blocks uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (asserts! (> blocks u0) err-invalid-amount)
    (var-set distribution-cooldown blocks)
    (print {
      event: "set-distribution-cooldown",
      blocks: blocks,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {blocks: blocks})
  )
)

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (var-set contract-owner new-owner)
    (print {
      event: "transfer-ownership",
      new-owner: new-owner,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {new-owner: new-owner})
  )
)
