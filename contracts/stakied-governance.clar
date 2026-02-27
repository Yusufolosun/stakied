;; Stakied Governance - Token-weighted governance voting
;; Proposal creation, vote casting, quorum checking, and execution

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u700))
(define-constant err-not-authorized (err u701))
(define-constant err-invalid-amount (err u702))
(define-constant err-proposal-not-found (err u703))
(define-constant err-voting-closed (err u704))
(define-constant err-already-voted (err u705))
(define-constant err-quorum-not-met (err u706))
(define-constant err-proposal-not-passed (err u707))
(define-constant err-already-executed (err u708))
(define-constant err-invalid-proposal (err u709))

;; Configuration
(define-constant voting-period u1008)      ;; ~7 days in blocks
(define-constant quorum-threshold u100000) ;; minimum votes required
(define-constant proposal-threshold u10000) ;; minimum tokens to create proposal

;; Data variables
(define-data-var proposal-count uint u0)

;; Data maps
(define-map proposals
  uint ;; proposal-id
  {
    proposer: principal,
    title: (string-ascii 64),
    description: (string-ascii 256),
    start-block: uint,
    end-block: uint,
    votes-for: uint,
    votes-against: uint,
    executed: bool,
    cancelled: bool
  }
)

(define-map votes
  {proposal-id: uint, voter: principal}
  {
    amount: uint,
    support: bool
  }
)

(define-map voting-power principal uint)

;; Read-only functions
(define-read-only (get-proposal (proposal-id uint))
  (ok (unwrap! (map-get? proposals proposal-id) err-proposal-not-found)))

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (ok (map-get? votes {proposal-id: proposal-id, voter: voter})))

(define-read-only (get-proposal-count)
  (ok (var-get proposal-count)))

(define-read-only (get-voting-power (user principal))
  (ok (default-to u0 (map-get? voting-power user))))

(define-read-only (is-proposal-active (proposal-id uint))
  (let (
    (prop (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
  )
    (ok (and
      (>= stacks-block-height (get start-block prop))
      (<= stacks-block-height (get end-block prop))
      (not (get cancelled prop))
    ))
  )
)

(define-read-only (has-quorum (proposal-id uint))
  (let (
    (prop (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
    (total-votes (+ (get votes-for prop) (get votes-against prop)))
  )
    (ok (>= total-votes quorum-threshold))
  )
)

(define-read-only (has-passed (proposal-id uint))
  (let (
    (prop (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
  )
    (ok (and
      (> (get votes-for prop) (get votes-against prop))
      (>= (+ (get votes-for prop) (get votes-against prop)) quorum-threshold)
      (> stacks-block-height (get end-block prop))
      (not (get cancelled prop))
    ))
  )
)

;; Public functions
(define-public (register-voting-power (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (map-set voting-power tx-sender
      (+ (default-to u0 (map-get? voting-power tx-sender)) amount))
    (print {action: "register-voting-power", user: tx-sender, amount: amount})
    (ok amount)
  )
)

(define-public (create-proposal (title (string-ascii 64)) (description (string-ascii 256)))
  (let (
    (power (default-to u0 (map-get? voting-power tx-sender)))
    (new-id (+ (var-get proposal-count) u1))
  )
    (asserts! (>= power proposal-threshold) err-not-authorized)

    (map-set proposals new-id {
      proposer: tx-sender,
      title: title,
      description: description,
      start-block: stacks-block-height,
      end-block: (+ stacks-block-height voting-period),
      votes-for: u0,
      votes-against: u0,
      executed: false,
      cancelled: false
    })

    (var-set proposal-count new-id)

    (print {action: "create-proposal", id: new-id, proposer: tx-sender, title: title})
    (ok new-id)
  )
)

(define-public (cast-vote (proposal-id uint) (support bool) (amount uint))
  (let (
    (prop (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
    (power (default-to u0 (map-get? voting-power tx-sender)))
  )
    ;; Validate voting conditions
    (asserts! (>= stacks-block-height (get start-block prop)) err-voting-closed)
    (asserts! (<= stacks-block-height (get end-block prop)) err-voting-closed)
    (asserts! (not (get cancelled prop)) err-voting-closed)
    (asserts! (is-none (map-get? votes {proposal-id: proposal-id, voter: tx-sender})) err-already-voted)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (<= amount power) err-invalid-amount)

    ;; Record vote
    (map-set votes {proposal-id: proposal-id, voter: tx-sender} {
      amount: amount,
      support: support
    })

    ;; Update proposal tallies
    (if support
      (map-set proposals proposal-id (merge prop {
        votes-for: (+ (get votes-for prop) amount)
      }))
      (map-set proposals proposal-id (merge prop {
        votes-against: (+ (get votes-against prop) amount)
      }))
    )

    (print {action: "cast-vote", proposal-id: proposal-id, voter: tx-sender, support: support, amount: amount})
    (ok true)
  )
)

(define-public (execute-proposal (proposal-id uint))
  (let (
    (prop (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
  )
    (asserts! (> stacks-block-height (get end-block prop)) err-voting-closed)
    (asserts! (not (get executed prop)) err-already-executed)
    (asserts! (not (get cancelled prop)) err-invalid-proposal)
    (asserts! (> (get votes-for prop) (get votes-against prop)) err-proposal-not-passed)
    (asserts! (>= (+ (get votes-for prop) (get votes-against prop)) quorum-threshold) err-quorum-not-met)

    (map-set proposals proposal-id (merge prop {executed: true}))

    (print {action: "execute-proposal", proposal-id: proposal-id, executor: tx-sender})
    (ok true)
  )
)

(define-public (cancel-proposal (proposal-id uint))
  (let (
    (prop (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
  )
    (asserts! (or (is-eq tx-sender (get proposer prop))
                  (is-eq tx-sender contract-owner))
              err-not-authorized)
    (asserts! (not (get executed prop)) err-already-executed)

    (map-set proposals proposal-id (merge prop {cancelled: true}))

    (print {action: "cancel-proposal", proposal-id: proposal-id, canceller: tx-sender})
    (ok true)
  )
)
