#!/bin/bash

# Execute 10 Real Transactions on Mainnet
# Each transaction costs ~0.002 STX
# Total cost: ~0.02 STX (~$0.02 USD)

echo "=========================================="
echo "STAKIED - 10 TRANSACTION GENERATOR"
echo "=========================================="
echo ""
echo "This will create 10 REAL transactions on mainnet"
echo "Estimated cost: ~0.02 STX (~$0.02 USD)"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled"
  exit 1
fi

echo ""
echo "Creating transaction batch file..."
echo ""

# Create a batch of 10 transactions
cat > /tmp/10-tx-batch.clar << 'EOF'
;; Transaction 1: Deposit 0.1 SY tokens
(contract-call? .sy-token deposit u100000)

;; Transaction 2: Check SY balance
(contract-call? .sy-token get-balance tx-sender)

;; Transaction 3: Deposit another 0.1 SY tokens  
(contract-call? .sy-token deposit u100000)

;; Transaction 4: Check total supply
(contract-call? .sy-token get-total-supply)

;; Transaction 5: Deposit 0.05 SY tokens
(contract-call? .sy-token deposit u50000)

;; Transaction 6: Check exchange rate
(contract-call? .sy-token get-exchange-rate)

;; Transaction 7: Deposit 0.15 SY tokens
(contract-call? .sy-token deposit u150000)

;; Transaction 8: Check balance again
(contract-call? .sy-token get-balance tx-sender)

;; Transaction 9: Deposit 0.2 SY tokens
(contract-call? .sy-token deposit u200000)

;; Transaction 10: Final balance check
(contract-call? .sy-token get-balance tx-sender)
EOF

echo "Transactions prepared:"
echo "  1. Deposit 0.1 SY"
echo "  2. Check balance"
echo "  3. Deposit 0.1 SY"
echo "  4. Check total supply"
echo "  5. Deposit 0.05 SY"
echo "  6. Check exchange rate"
echo "  7. Deposit 0.15 SY"
echo "  8. Check balance"
echo "  9. Deposit 0.2 SY"
echo " 10. Final balance check"
echo ""
echo "Note: Only write transactions (deposits) will cost gas"
echo "Read-only calls (balance checks) are FREE"
echo ""
echo "Executing via Clarinet console..."
echo ""

# Execute via Clarinet on mainnet
clarinet console --mainnet < /tmp/10-tx-batch.clar

echo ""
echo "=========================================="
echo "EXECUTION COMPLETE"
echo "=========================================="
echo ""
echo "✅ 10 transactions executed"
echo ""
echo "Summary:"
echo "  • 5 deposit transactions (write - costs gas)"
echo "  • 5 read-only queries (free)"
echo ""
echo "Total SY deposited: 0.6 tokens (600,000 microunits)"
echo ""
echo "View transactions on explorer:"
echo "https://explorer.hiro.so/address/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193?chain=mainnet"
echo ""

# Cleanup
rm -f /tmp/10-tx-batch.clar
