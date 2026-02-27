;; Stakied Staking Pool - Time-weighted staking with rewards distribution
;; Users lock SY tokens for configurable durations and accrue rewards proportionally

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-not-authorized (err u401))
(define-constant err-invalid-amount (err u402))
(define-constant err-insufficient-balance (err u403))
(define-constant err-lock-not-expired (err u404))
(define-constant err-no-stake (err u405))
(define-constant err-pool-paused (err u406))
(define-constant err-invalid-duration (err u407))
(define-constant err-already-staked (err u408))
(define-constant err-zero-rewards (err u409))

;; Configuration
(define-constant min-lock-duration u144)    ;; ~1 day in blocks
(define-constant max-lock-duration u52560)  ;; ~1 year in blocks
(define-constant reward-rate-per-block u10) ;; 10 micro-units per block per staked token

;; Data variables
(define-data-var total-staked uint u0)
(define-data-var reward-pool uint u0)
(define-data-var global-reward-index uint u0)
(define-data-var last-reward-block uint u0)
(define-data-var pool-paused bool false)

;; Data maps
(define-map stakes
  principal
  {
    amount: uint,
    lock-until: uint,
    reward-debt: uint,
    staked-at: uint
  }
)

;; Read-only functions
(define-read-only (get-stake-info (user principal))
  (ok (map-get? stakes user)))

(define-read-only (get-pool-info)
  (ok {
    total-staked: (var-get total-staked),
    reward-pool: (var-get reward-pool),
    global-reward-index: (var-get global-reward-index),
    last-reward-block: (var-get last-reward-block),
    paused: (var-get pool-paused)
  }))

(define-read-only (get-pending-rewards (user principal))
  (let (
    (stake-data (unwrap! (map-get? stakes user) (ok u0)))
    (user-amount (get amount stake-data))
    (user-debt (get reward-debt stake-data))
    (current-index (var-get global-reward-index))
    (accrued (/ (* user-amount current-index) u1000000))
  )
    (ok (if (> accrued user-debt)
          (- accrued user-debt)
          u0))
  )
)

;; Public functions
(define-public (stake (amount uint) (lock-duration uint))
  (begin
    (asserts! (not (var-get pool-paused)) err-pool-paused)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= lock-duration min-lock-duration) err-invalid-duration)
    (asserts! (<= lock-duration max-lock-duration) err-invalid-duration)
    (asserts! (is-none (map-get? stakes tx-sender)) err-already-staked)

    ;; Transfer SY tokens from user to this contract
    (try! (contract-call? .stakied-sy-token transfer amount tx-sender (as-contract tx-sender) none))

    ;; Update global reward index before state changes
    (update-reward-index)

    ;; Record stake
    (map-set stakes tx-sender {
      amount: amount,
      lock-until: (+ stacks-block-height lock-duration),
      reward-debt: (/ (* amount (var-get global-reward-index)) u1000000),
      staked-at: stacks-block-height
    })

    (var-set total-staked (+ (var-get total-staked) amount))

    (print {action: "stake", user: tx-sender, amount: amount, lock-until: (+ stacks-block-height lock-duration)})
    (ok amount)
  )
)

(define-public (unstake)
  (let (
    (stake-data (unwrap! (map-get? stakes tx-sender) err-no-stake))
    (staked-amount (get amount stake-data))
    (lock-until (get lock-until stake-data))
  )
    (asserts! (>= stacks-block-height lock-until) err-lock-not-expired)

    ;; Claim any pending rewards first
    (update-reward-index)
    (let (
      (pending (unwrap-panic (get-pending-rewards tx-sender)))
    )
      ;; Transfer staked tokens back
      (try! (as-contract (contract-call? .stakied-sy-token transfer staked-amount tx-sender (unwrap-panic (get-caller)) none)))

      ;; Remove stake record
      (map-delete stakes tx-sender)
      (var-set total-staked (- (var-get total-staked) staked-amount))

      (print {action: "unstake", user: tx-sender, amount: staked-amount, rewards: pending})
      (ok {amount: staked-amount, rewards: pending})
    )
  )
)

(define-public (claim-rewards)
  (let (
    (stake-data (unwrap! (map-get? stakes tx-sender) err-no-stake))
    (pending (unwrap-panic (get-pending-rewards tx-sender)))
  )
    (asserts! (> pending u0) err-zero-rewards)

    ;; Update reward debt
    (map-set stakes tx-sender (merge stake-data {
      reward-debt: (/ (* (get amount stake-data) (var-get global-reward-index)) u1000000)
    }))

    (var-set reward-pool (if (> (var-get reward-pool) pending)
                            (- (var-get reward-pool) pending)
                            u0))

    (print {action: "claim-rewards", user: tx-sender, amount: pending})
    (ok pending)
  )
)

(define-public (fund-reward-pool (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (var-set reward-pool (+ (var-get reward-pool) amount))
    (print {action: "fund-reward-pool", funder: tx-sender, amount: amount})
    (ok amount)
  )
)

(define-public (set-pool-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set pool-paused paused)
    (print {action: "set-pool-paused", paused: paused})
    (ok paused)
  )
)

;; Private helpers
(define-private (get-caller)
  (ok tx-sender))

(define-private (update-reward-index)
  (let (
    (total (var-get total-staked))
    (last-block (var-get last-reward-block))
    (blocks-elapsed (if (> stacks-block-height last-block)
                       (- stacks-block-height last-block)
                       u0))
  )
    (if (and (> total u0) (> blocks-elapsed u0))
      (let ((new-rewards (* blocks-elapsed reward-rate-per-block)))
        (var-set global-reward-index 
          (+ (var-get global-reward-index) (/ (* new-rewards u1000000) total)))
        (var-set last-reward-block stacks-block-height)
      )
      (var-set last-reward-block stacks-block-height)
    )
  )
)
