;; Stakied Liquidity Gauge - LP incentive gauge with boost mechanics
;; LP stakers earn boosted rewards based on governance token balance

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u900))
(define-constant err-not-authorized (err u901))
(define-constant err-invalid-amount (err u902))
(define-constant err-insufficient-balance (err u903))
(define-constant err-no-stake (err u904))
(define-constant err-gauge-paused (err u905))
(define-constant err-invalid-rate (err u906))
(define-constant err-no-rewards (err u907))
(define-constant err-invalid-maturity (err u908))
(define-constant err-invalid-boost (err u909))

;; Boost configuration
(define-constant max-boost u2500000)     ;; 2.5x max boost (6 decimals)
(define-constant min-boost u1000000)     ;; 1.0x min boost (6 decimals)
(define-constant boost-precision u1000000)
(define-constant reward-precision u1000000000000) ;; 12 decimals

;; Data variables
(define-data-var emission-rate uint u100)   ;; tokens per block
(define-data-var total-staked-lp uint u0)
(define-data-var global-reward-per-token uint u0)
(define-data-var last-update-block uint u0)
(define-data-var gauge-paused bool false)
(define-data-var total-boosted-supply uint u0)

;; Data maps
(define-map lp-stakes
  principal
  {
    amount: uint,
    maturity: uint,
    boosted-amount: uint,
    reward-per-token-paid: uint,
    pending-rewards: uint,
    staked-at: uint
  }
)

;; Governance token balances for boost calculation
(define-map governance-balances principal uint)

;; Read-only functions
(define-read-only (get-lp-stake (user principal))
  (ok (map-get? lp-stakes user)))

(define-read-only (get-gauge-info)
  (ok {
    emission-rate: (var-get emission-rate),
    total-staked-lp: (var-get total-staked-lp),
    total-boosted-supply: (var-get total-boosted-supply),
    global-reward-per-token: (var-get global-reward-per-token),
    last-update-block: (var-get last-update-block),
    paused: (var-get gauge-paused)
  }))

(define-read-only (get-boost-factor (user principal))
  (let (
    (gov-balance (default-to u0 (map-get? governance-balances user)))
    (user-stake (map-get? lp-stakes user))
  )
    (match user-stake
      stake-data
        (let (
          (staked (get amount stake-data))
          (total (var-get total-staked-lp))
        )
          (if (or (is-eq staked u0) (is-eq total u0))
            (ok min-boost)
            ;; boost = min(2.5, 1.0 + 1.5 * (gov_balance / total_staked))
            (let (
              (gov-ratio (/ (* gov-balance boost-precision) total))
              (bonus (/ (* gov-ratio u1500000) boost-precision))
              (raw-boost (+ min-boost bonus))
            )
              (ok (if (> raw-boost max-boost) max-boost raw-boost))
            )
          )
        )
      (ok min-boost)
    )
  )
)

(define-read-only (get-earned (user principal))
  (let (
    (stake-data (unwrap! (map-get? lp-stakes user) (ok u0)))
    (boosted (get boosted-amount stake-data))
    (paid (get reward-per-token-paid stake-data))
    (pending (get pending-rewards stake-data))
    (current-rpt (calculate-reward-per-token))
  )
    (ok (+ pending (/ (* boosted (- current-rpt paid)) reward-precision)))
  )
)

;; Private helpers
(define-private (calculate-reward-per-token)
  (let (
    (total-boosted (var-get total-boosted-supply))
    (last-block (var-get last-update-block))
    (blocks-elapsed (if (> stacks-block-height last-block)
                       (- stacks-block-height last-block)
                       u0))
    (new-rewards (* blocks-elapsed (var-get emission-rate)))
  )
    (if (is-eq total-boosted u0)
      (var-get global-reward-per-token)
      (+ (var-get global-reward-per-token)
         (/ (* new-rewards reward-precision) total-boosted))
    )
  )
)

(define-private (update-rewards (user principal))
  (let (
    (new-rpt (calculate-reward-per-token))
  )
    (var-set global-reward-per-token new-rpt)
    (var-set last-update-block stacks-block-height)

    (match (map-get? lp-stakes user)
      stake-data
        (let (
          (earned (/ (* (get boosted-amount stake-data) (- new-rpt (get reward-per-token-paid stake-data))) reward-precision))
        )
          (map-set lp-stakes user (merge stake-data {
            pending-rewards: (+ (get pending-rewards stake-data) earned),
            reward-per-token-paid: new-rpt
          }))
        )
      true
    )
  )
)

;; Public functions
(define-public (stake-lp (amount uint) (maturity uint))
  (begin
    (asserts! (not (var-get gauge-paused)) err-gauge-paused)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (> maturity u0) err-invalid-maturity)

    ;; Update rewards before state changes
    (update-rewards tx-sender)

    (let (
      (boost (unwrap-panic (get-boost-factor tx-sender)))
      (boosted-amount (/ (* amount boost) boost-precision))
      (existing (map-get? lp-stakes tx-sender))
    )
      (match existing
        prev-stake
          ;; Add to existing stake
          (let (
            (new-amount (+ (get amount prev-stake) amount))
            (new-boosted (+ (get boosted-amount prev-stake) boosted-amount))
          )
            (map-set lp-stakes tx-sender (merge prev-stake {
              amount: new-amount,
              boosted-amount: new-boosted
            }))
            (var-set total-boosted-supply (+ (var-get total-boosted-supply) boosted-amount))
          )
        ;; New stake
        (map-set lp-stakes tx-sender {
          amount: amount,
          maturity: maturity,
          boosted-amount: boosted-amount,
          reward-per-token-paid: (var-get global-reward-per-token),
          pending-rewards: u0,
          staked-at: stacks-block-height
        })
      )

      (var-set total-staked-lp (+ (var-get total-staked-lp) amount))
      (match existing
        prev-stake true
        (var-set total-boosted-supply (+ (var-get total-boosted-supply) boosted-amount))
      )

      (print {action: "stake-lp", user: tx-sender, amount: amount, boost: boost, boosted-amount: boosted-amount})
      (ok {amount: amount, boost: boost})
    )
  )
)

(define-public (unstake-lp (amount uint))
  (let (
    (stake-data (unwrap! (map-get? lp-stakes tx-sender) err-no-stake))
    (staked (get amount stake-data))
  )
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (<= amount staked) err-insufficient-balance)

    ;; Update rewards
    (update-rewards tx-sender)

    (let (
      (boosted-ratio (if (> staked u0) (/ (* (get boosted-amount stake-data) amount) staked) u0))
      (remaining (- staked amount))
    )
      (if (is-eq remaining u0)
        ;; Full unstake - remove entry
        (begin
          (map-delete lp-stakes tx-sender)
          (var-set total-boosted-supply (- (var-get total-boosted-supply) (get boosted-amount stake-data)))
        )
        ;; Partial unstake
        (begin
          (map-set lp-stakes tx-sender (merge stake-data {
            amount: remaining,
            boosted-amount: (- (get boosted-amount stake-data) boosted-ratio)
          }))
          (var-set total-boosted-supply (- (var-get total-boosted-supply) boosted-ratio))
        )
      )

      (var-set total-staked-lp (- (var-get total-staked-lp) amount))

      (print {action: "unstake-lp", user: tx-sender, amount: amount})
      (ok amount)
    )
  )
)

(define-public (claim-gauge-rewards)
  (let (
    (stake-data (unwrap! (map-get? lp-stakes tx-sender) err-no-stake))
  )
    ;; Update rewards
    (update-rewards tx-sender)

    ;; Re-read after update
    (let (
      (updated-stake (unwrap-panic (map-get? lp-stakes tx-sender)))
      (pending (get pending-rewards updated-stake))
    )
      (asserts! (> pending u0) err-no-rewards)

      (map-set lp-stakes tx-sender (merge updated-stake {
        pending-rewards: u0
      }))

      (print {action: "claim-gauge-rewards", user: tx-sender, amount: pending})
      (ok pending)
    )
  )
)

(define-public (set-emission-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> new-rate u0) err-invalid-rate)

    ;; Update global state before changing rate
    (var-set global-reward-per-token (calculate-reward-per-token))
    (var-set last-update-block stacks-block-height)
    (var-set emission-rate new-rate)

    (print {action: "set-emission-rate", rate: new-rate})
    (ok new-rate)
  )
)

(define-public (set-governance-balance (user principal) (balance uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set governance-balances user balance)
    (print {action: "set-governance-balance", user: user, balance: balance})
    (ok true)
  )
)

(define-public (set-gauge-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set gauge-paused paused)
    (print {action: "set-gauge-paused", paused: paused})
    (ok paused)
  )
)
