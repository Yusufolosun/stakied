;; Stakied Rewards Distributor - Yield rewards distribution engine
;; Distributes accumulated yield to YT holders across maturities

;; Constants
;; Governance
(define-data-var contract-owner principal tx-sender)
;; Error Constants (Unified Schema)
(define-constant err-owner-only (err u1))          ;; Unauthorized owner action
(define-constant err-not-authorized (err u2))      ;; Action not allowed for caller
(define-constant err-paused (err u3))              ;; Contract is currently paused
(define-constant err-invalid-amount (err u4))      ;; Provided amount is zero or invalid
(define-constant err-no-rewards (err u800))         ;; No rewards available to claim
(define-constant err-invalid-maturity (err u801))    ;; Provided maturity date is invalid
(define-constant err-already-claimed (err u802))     ;; Rewards already claimed for this period
(define-constant err-no-supply (err u803))          ;; Total supply is zero for distribution
(define-constant err-epoch-not-ended (err u804))     ;; Epochยังไม่จบ
(define-constant err-invalid-epoch (err u805))       ;; Provided epoch ID is invalid

;; Precision for reward index calculations
(define-constant index-precision u1000000000000) ;; 12 decimals

;; Data variables
(define-data-var total-distributed uint u0)
(define-data-var current-epoch uint u0)
(define-data-var epoch-length uint u1008) ;; ~7 days in blocks
(define-data-var is-paused bool false)

;; Data maps - reward indices per maturity
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
    is-paused: (var-get is-paused)
  }))

;; Public functions
(define-public (distribute-rewards (maturity uint) (amount uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
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
        last-update: block-height
      })

      (var-set total-distributed (+ (var-get total-distributed) amount))

      (print {
        event: "distribute-rewards",
        maturity: maturity,
        amount: amount,
        new-index: new-index,
        contract: (as-contract tx-sender)
      })
      (ok {maturity: maturity, amount: amount, new-index: new-index})
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
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (> pending u0) err-no-rewards)

    ;; Update user state
    (map-set user-reward-state {user: tx-sender, maturity: maturity} {
      user-index: (get global-index global-state),
      accrued: u0,
      claimed: (+ (get claimed user-state) pending)
    })

    (print {
      event: "claim-user-rewards",
      user: tx-sender,
      maturity: maturity,
      amount: pending,
      contract: (as-contract tx-sender)
    })
    (ok {user: tx-sender, maturity: maturity, amount: pending})
  )
)

(define-public (create-epoch (amount uint))
  (begin
    (asserts! (not (var-get is-paused)) err-paused)
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)

    (let ((new-epoch (+ (var-get current-epoch) u1)))
      (map-set epoch-rewards new-epoch {
        amount: amount,
        start-block: block-height,
        end-block: (+ block-height (var-get epoch-length)),
        distributed: false
      })

      (var-set current-epoch new-epoch)

      (print {
        event: "create-epoch",
        epoch: new-epoch,
        amount: amount,
        contract: (as-contract tx-sender)
      })
      (ok {epoch: new-epoch, amount: amount})
    )
  )
)

(define-public (set-epoch-length (new-length uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
    (asserts! (> new-length u0) err-invalid-amount)
    (var-set epoch-length new-length)
    (print {
      event: "set-epoch-length",
      length: new-length,
      updater: tx-sender,
      contract: (as-contract tx-sender)
    })
    (ok {new-length: new-length})
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
