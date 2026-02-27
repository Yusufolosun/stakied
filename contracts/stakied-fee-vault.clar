;; Stakied Fee Vault - Protocol fee collection and distribution
;; Collects trading/redemption fees and distributes to treasury or stakers

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u500))
(define-constant err-not-authorized (err u501))
(define-constant err-invalid-amount (err u502))
(define-constant err-insufficient-balance (err u503))
(define-constant err-invalid-recipient (err u504))
(define-constant err-vault-paused (err u505))
(define-constant err-invalid-split (err u506))
(define-constant err-no-fees (err u507))
(define-constant err-cooldown-active (err u508))
(define-constant err-zero-address (err u509))

;; Fee split: basis points out of 10000
(define-constant bps-denominator u10000)

;; Data variables
(define-data-var total-fees-collected uint u0)
(define-data-var total-fees-distributed uint u0)
(define-data-var treasury-address principal contract-owner)
(define-data-var treasury-split-bps uint u5000) ;; 50% to treasury
(define-data-var staker-split-bps uint u5000)   ;; 50% to stakers
(define-data-var vault-paused bool false)
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
    paused: (var-get vault-paused)
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
    (asserts! (not (var-get vault-paused)) err-vault-paused)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (or (is-eq tx-sender contract-owner)
                  (default-to false (map-get? authorized-collectors tx-sender)))
              err-not-authorized)

    ;; Track fee by source
    (map-set fee-balances source
      (+ (default-to u0 (map-get? fee-balances source)) amount))
    
    (var-set total-fees-collected (+ (var-get total-fees-collected) amount))

    (print {action: "collect-fee", collector: tx-sender, source: source, amount: amount})
    (ok amount)
  )
)

(define-public (distribute-fees)
  (let (
    (pending (- (var-get total-fees-collected) (var-get total-fees-distributed)))
    (last-dist (var-get last-distribution-block))
    (cooldown (var-get distribution-cooldown))
  )
    (asserts! (not (var-get vault-paused)) err-vault-paused)
    (asserts! (> pending u0) err-no-fees)
    (asserts! (>= stacks-block-height (+ last-dist cooldown)) err-cooldown-active)

    (let (
      (treasury-share (/ (* pending (var-get treasury-split-bps)) bps-denominator))
      (staker-share (- pending treasury-share))
    )
      (var-set total-fees-distributed (+ (var-get total-fees-distributed) pending))
      (var-set last-distribution-block stacks-block-height)

      (print {
        action: "distribute-fees",
        total: pending,
        treasury-share: treasury-share,
        staker-share: staker-share,
        block: stacks-block-height
      })
      (ok {treasury: treasury-share, stakers: staker-share})
    )
  )
)

(define-public (set-fee-recipient (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set treasury-address new-treasury)
    (print {action: "set-fee-recipient", new-treasury: new-treasury})
    (ok true)
  )
)

(define-public (set-fee-split (new-treasury-bps uint) (new-staker-bps uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (is-eq (+ new-treasury-bps new-staker-bps) bps-denominator) err-invalid-split)
    (var-set treasury-split-bps new-treasury-bps)
    (var-set staker-split-bps new-staker-bps)
    (print {action: "set-fee-split", treasury-bps: new-treasury-bps, staker-bps: new-staker-bps})
    (ok true)
  )
)

(define-public (authorize-collector (collector principal) (authorized bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set authorized-collectors collector authorized)
    (print {action: "authorize-collector", collector: collector, authorized: authorized})
    (ok true)
  )
)

(define-public (set-vault-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set vault-paused paused)
    (print {action: "set-vault-paused", paused: paused})
    (ok paused)
  )
)

(define-public (set-distribution-cooldown (blocks uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> blocks u0) err-invalid-amount)
    (var-set distribution-cooldown blocks)
    (print {action: "set-distribution-cooldown", blocks: blocks})
    (ok blocks)
  )
)
