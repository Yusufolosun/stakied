;; Stakied Oracle - Price and yield rate feed oracle
;; Owner publishes price updates, consumers query with staleness checks

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u600))
(define-constant err-not-authorized (err u601))
(define-constant err-invalid-price (err u602))
(define-constant err-stale-price (err u603))
(define-constant err-no-price-data (err u604))
(define-constant err-invalid-feed (err u605))
(define-constant err-feed-paused (err u606))
(define-constant err-invalid-threshold (err u607))
(define-constant err-price-deviation (err u608))
(define-constant err-not-updater (err u609))

;; Price precision (6 decimals)
(define-constant price-precision u1000000)
;; Max price deviation allowed per update (10%)
(define-constant max-deviation-bps u1000)
(define-constant bps-denominator u10000)

;; Data variables
(define-data-var staleness-threshold uint u720) ;; ~5 days in blocks
(define-data-var current-round uint u0)

;; Data maps
(define-map price-feeds
  (string-ascii 32) ;; feed-id e.g. "SY-STX", "PT-RATE"
  {
    price: uint,
    updated-at: uint,
    round: uint,
    updater: principal
  }
)

(define-map authorized-updaters principal bool)
(define-map feed-configs
  (string-ascii 32)
  {
    active: bool,
    min-price: uint,
    max-price: uint
  }
)

;; Read-only functions
(define-read-only (get-price (feed-id (string-ascii 32)))
  (let (
    (feed-data (unwrap! (map-get? price-feeds feed-id) err-no-price-data))
    (threshold (var-get staleness-threshold))
  )
    (asserts! (<= (- stacks-block-height (get updated-at feed-data)) threshold) err-stale-price)
    (ok {
      price: (get price feed-data),
      updated-at: (get updated-at feed-data),
      round: (get round feed-data)
    })
  )
)

(define-read-only (get-price-unsafe (feed-id (string-ascii 32)))
  (let (
    (feed-data (unwrap! (map-get? price-feeds feed-id) err-no-price-data))
  )
    (ok {
      price: (get price feed-data),
      updated-at: (get updated-at feed-data),
      round: (get round feed-data),
      is-stale: (> (- stacks-block-height (get updated-at feed-data)) (var-get staleness-threshold))
    })
  )
)

(define-read-only (get-latest-round)
  (ok (var-get current-round)))

(define-read-only (get-staleness-threshold)
  (ok (var-get staleness-threshold)))

(define-read-only (get-feed-config (feed-id (string-ascii 32)))
  (ok (map-get? feed-configs feed-id)))

(define-read-only (is-feed-stale (feed-id (string-ascii 32)))
  (let (
    (feed-data (unwrap! (map-get? price-feeds feed-id) err-no-price-data))
  )
    (ok (> (- stacks-block-height (get updated-at feed-data)) (var-get staleness-threshold)))
  )
)

;; Public functions
(define-public (update-price (feed-id (string-ascii 32)) (new-price uint))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner)
                  (default-to false (map-get? authorized-updaters tx-sender)))
              err-not-updater)
    (asserts! (> new-price u0) err-invalid-price)

    ;; Check feed config bounds if configured
    (match (map-get? feed-configs feed-id)
      config
        (begin
          (asserts! (get active config) err-feed-paused)
          (asserts! (>= new-price (get min-price config)) err-invalid-price)
          (asserts! (<= new-price (get max-price config)) err-invalid-price)
        )
      true ;; no config = no bounds check
    )

    ;; Check price deviation from last update (if exists)
    (match (map-get? price-feeds feed-id)
      existing
        (let (
          (old-price (get price existing))
          (diff (if (> new-price old-price) (- new-price old-price) (- old-price new-price)))
          (deviation-bps (/ (* diff bps-denominator) old-price))
        )
          (asserts! (<= deviation-bps max-deviation-bps) err-price-deviation)
        )
      true ;; first update has no deviation check
    )

    ;; Update price feed
    (let ((new-round (+ (var-get current-round) u1)))
      (map-set price-feeds feed-id {
        price: new-price,
        updated-at: stacks-block-height,
        round: new-round,
        updater: tx-sender
      })
      (var-set current-round new-round)

      (print {action: "update-price", feed-id: feed-id, price: new-price, round: new-round})
      (ok new-round)
    )
  )
)

(define-public (set-staleness-threshold (new-threshold uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> new-threshold u0) err-invalid-threshold)
    (var-set staleness-threshold new-threshold)
    (print {action: "set-staleness-threshold", threshold: new-threshold})
    (ok new-threshold)
  )
)

(define-public (authorize-updater (updater principal) (authorized bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set authorized-updaters updater authorized)
    (print {action: "authorize-updater", updater: updater, authorized: authorized})
    (ok true)
  )
)

(define-public (configure-feed (feed-id (string-ascii 32)) (active bool) (min-price uint) (max-price uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (< min-price max-price) err-invalid-price)
    (map-set feed-configs feed-id {
      active: active,
      min-price: min-price,
      max-price: max-price
    })
    (print {action: "configure-feed", feed-id: feed-id, active: active, min-price: min-price, max-price: max-price})
    (ok true)
  )
)
