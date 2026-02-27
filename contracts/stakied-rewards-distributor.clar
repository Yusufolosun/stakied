;; Stakied Rewards Distributor - Yield rewards distribution engine
;; Distributes accumulated yield to YT holders across maturities

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u800))
(define-constant err-not-authorized (err u801))
(define-constant err-invalid-amount (err u802))
(define-constant err-no-rewards (err u803))
(define-constant err-invalid-maturity (err u804))
(define-constant err-already-claimed (err u805))
(define-constant err-distributor-paused (err u806))
(define-constant err-no-supply (err u807))
(define-constant err-epoch-not-ended (err u808))
(define-constant err-invalid-epoch (err u809))

;; Precision for reward index calculations
(define-constant index-precision u1000000000000) ;; 12 decimals

;; Data variables
(define-data-var total-distributed uint u0)
(define-data-var current-epoch uint u0)
(define-data-var epoch-length uint u1008) ;; ~7 days in blocks
(define-data-var distributor-paused bool false)

;; Data maps — reward indices per maturity
(define-map reward-indices
  uint ;; maturity
  {
    global-index: uint,
    total-rewards: uint,
    last-update: uint
  }
)

;; Per-user reward tracking
(define-map user-reward-state
  {user: principal, maturity: uint}
  {
    user-index: uint,
    accrued: uint,
    claimed: uint
  }
)

;; Epoch reward pools
(define-map epoch-rewards
  uint ;; epoch-id
  {
    amount: uint,
    start-block: uint,
    end-block: uint,
    distributed: bool
  }
)

;; Read-only functions
(define-read-only (get-reward-index (maturity uint))
  (ok (default-to
    {global-index: u0, total-rewards: u0, last-update: u0}
    (map-get? reward-indices maturity))))

(define-read-only (get-user-reward-state (user principal) (maturity uint))
  (ok (default-to
    {user-index: u0, accrued: u0, claimed: u0}
    (map-get? user-reward-state {user: user, maturity: maturity}))))

(define-read-only (get-pending-rewards (user principal) (maturity uint))
  (let (
    (global-state (default-to
      {global-index: u0, total-rewards: u0, last-update: u0}
      (map-get? reward-indices maturity)))
    (user-state (default-to
      {user-index: u0, accrued: u0, claimed: u0}
      (map-get? user-reward-state {user: user, maturity: maturity})))
    (index-diff (- (get global-index global-state) (get user-index user-state)))
  )
    ;; Simplified: pending = accrued from index diff
    ;; In production this would query YT balance from pt-yt-core
    (ok (+ (get accrued user-state) index-diff))
  )
)

(define-read-only (get-epoch-info (epoch-id uint))
  (ok (map-get? epoch-rewards epoch-id)))

(define-read-only (get-current-epoch)
  (ok (var-get current-epoch)))

(define-read-only (get-distribution-stats)
  (ok {
    total-distributed: (var-get total-distributed),
    current-epoch: (var-get current-epoch),
    epoch-length: (var-get epoch-length),
    paused: (var-get distributor-paused)
  }))

;; Public functions
(define-public (distribute-rewards (maturity uint) (amount uint))
  (begin
    (asserts! (not (var-get distributor-paused)) err-distributor-paused)
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (> maturity u0) err-invalid-maturity)

    (let (
      (current-state (default-to
        {global-index: u0, total-rewards: u0, last-update: u0}
        (map-get? reward-indices maturity)))
      ;; In production, query actual YT total supply from pt-yt-core
      ;; For now, use a safe default
      (new-index (+ (get global-index current-state) (/ (* amount index-precision) (+ amount u1))))
    )
      (map-set reward-indices maturity {
        global-index: new-index,
        total-rewards: (+ (get total-rewards current-state) amount),
        last-update: stacks-block-height
      })

      (var-set total-distributed (+ (var-get total-distributed) amount))

      (print {action: "distribute-rewards", maturity: maturity, amount: amount, new-index: new-index})
      (ok new-index)
    )
  )
)

(define-public (claim-user-rewards (maturity uint))
  (let (
    (pending (unwrap-panic (get-pending-rewards tx-sender maturity)))
    (user-state (default-to
      {user-index: u0, accrued: u0, claimed: u0}
      (map-get? user-reward-state {user: tx-sender, maturity: maturity})))
    (global-state (default-to
      {global-index: u0, total-rewards: u0, last-update: u0}
      (map-get? reward-indices maturity)))
  )
    (asserts! (not (var-get distributor-paused)) err-distributor-paused)
    (asserts! (> pending u0) err-no-rewards)

    ;; Update user state
    (map-set user-reward-state {user: tx-sender, maturity: maturity} {
      user-index: (get global-index global-state),
      accrued: u0,
      claimed: (+ (get claimed user-state) pending)
    })

    (print {action: "claim-user-rewards", user: tx-sender, maturity: maturity, amount: pending})
    (ok pending)
  )
)

(define-public (create-epoch (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)

    (let ((new-epoch (+ (var-get current-epoch) u1)))
      (map-set epoch-rewards new-epoch {
        amount: amount,
        start-block: stacks-block-height,
        end-block: (+ stacks-block-height (var-get epoch-length)),
        distributed: false
      })

      (var-set current-epoch new-epoch)

      (print {action: "create-epoch", epoch: new-epoch, amount: amount})
      (ok new-epoch)
    )
  )
)

(define-public (set-epoch-length (new-length uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> new-length u0) err-invalid-amount)
    (var-set epoch-length new-length)
    (print {action: "set-epoch-length", length: new-length})
    (ok new-length)
  )
)

(define-public (set-distributor-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set distributor-paused paused)
    (print {action: "set-distributor-paused", paused: paused})
    (ok paused)
  )
)
