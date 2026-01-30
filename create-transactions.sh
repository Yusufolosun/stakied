#!/bin/bash

# Quick Transaction Script - Mainnet
# Connect to mainnet console and execute transactions

echo "Starting Clarinet mainnet console..."
echo "You can execute transactions like:"
echo ""
echo "Examples:"
echo "=========="
echo ""
echo "1. Deposit 1 SY token:"
echo "   (contract-call? .sy-token deposit u1000000)"
echo ""
echo "2. Check your SY balance:"
echo "   (contract-call? .sy-token get-balance tx-sender)"
echo ""
echo "3. Mint PT/YT (1 token, maturity block 100000):"
echo "   (contract-call? .pt-yt-core mint-pt-yt u1000000 u100000)"
echo ""
echo "4. Transfer 0.5 SY to another address:"
echo "   (contract-call? .sy-token transfer u500000 tx-sender 'SP2... none)"
echo ""
echo "Starting console..."
echo ""

clarinet console --mainnet
