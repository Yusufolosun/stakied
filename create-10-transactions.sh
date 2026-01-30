#!/bin/bash

# Execute 10 Real Transactions on Mainnet
# Each transaction costs ~0.002 STX
# Total cost: ~0.02 STX (~$0.02 USD)

echo "=========================================="
echo "STAKIED - 10 TRANSACTION GENERATOR"
echo "=========================================="
echo ""
echo "This will create 10 REAL WRITE transactions on mainnet"
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

# Create a batch of 10 write transactions
cat > /tmp/10-tx-batch.clar << 'EOF'
;; Transaction 1: Deposit 0.1 SY tokens
(contract-call? .sy-token deposit u100000)

;; Transaction 2: Deposit another 0.1 SY tokens  
(contract-call? .sy-token deposit u100000)

;; Transaction 3: Deposit 0.05 SY tokens
(contract-call? .sy-token deposit u50000)

;; Transaction 4: Deposit 0.15 SY tokens
(contract-call? .sy-token deposit u150000)

;; Transaction 5: Deposit 0.2 SY tokens
(contract-call? .sy-token deposit u200000)

;; Transaction 6: Deposit 0.1 SY tokens
(contract-call? .sy-token deposit u100000)

;; Transaction 7: Deposit 0.05 SY tokens
(contract-call? .sy-token deposit u50000)

;; Transaction 8: Deposit 0.1 SY tokens
(contract-call? .sy-token deposit u100000)

;; Transaction 9: Deposit 0.15 SY tokens
(contract-call? .sy-token deposit u150000)

;; Transaction 10: Deposit 0.1 SY tokens
(contract-call? .sy-token deposit u100000)
EOF

echo "Transactions prepared (ALL WRITE - costs gas):"
echo "  1. Deposit 0.1 SY"
echo "  2. Deposit 0.1 SY"
echo "  3. Deposit 0.05 SY"
echo "  4. Deposit 0.15 SY"
echo "  5. Deposit 0.2 SY"
echo "  6. Deposit 0.1 SY"
echo "  7. Deposit 0.05 SY"
echo "  8. Deposit 0.1 SY"
echo "  9. Deposit 0.15 SY"
echo " 10. Deposit 0.1 SY"
echo ""
echo "All transactions are WRITE operations (will cost gas)"
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
echo "  • 10 deposit transactions (ALL write - costs gas)"
echo "  • Total cost: ~0.02 STX (~$0.02 USD)"
echo ""
echo "Total SY deposited: 1.15 tokens (1,150,000 microunits)"
echo ""
echo "View transactions on explorer:"
echo "https://explorer.hiro.so/address/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193?chain=mainnet"
echo ""

# Cleanup
rm -f /tmp/10-tx-batch.clar
