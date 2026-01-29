#!/bin/bash

# Mainnet Deployment Verification Script
# Verifies all contracts are live and functional on Stacks Mainnet

echo "=========================================="
echo "STAKIED MAINNET DEPLOYMENT VERIFICATION"
echo "=========================================="
echo ""

DEPLOYER="SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193"
API_URL="https://api.hiro.so"

echo "Deployer Address: $DEPLOYER"
echo "Network: Stacks Mainnet"
echo "API: $API_URL"
echo ""

# Function to check contract
check_contract() {
    local contract_name=$1
    local full_address="${DEPLOYER}.${contract_name}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Checking: $contract_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    response=$(curl -s "${API_URL}/v2/contracts/interface/${full_address}")
    
    if echo "$response" | grep -q "error"; then
        echo "❌ FAILED: $contract_name not found or error"
        echo "Response: $response"
        return 1
    else
        echo "✅ DEPLOYED: $contract_name is live on mainnet"
        return 0
    fi
}

# Check all contracts
echo "Verifying deployed contracts..."
echo ""

check_contract "sip-010-trait"
SIP_STATUS=$?
echo ""

check_contract "sy-token"
SY_STATUS=$?
echo ""

check_contract "pt-yt-core"
PT_STATUS=$?
echo ""

# SY Token specific checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SY Token Read-Only Function Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check SY token name
echo "1. Checking get-name..."
curl -s -X POST "${API_URL}/v2/contracts/call-read/${DEPLOYER}/sy-token/get-name" \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": "'${DEPLOYER}'",
    "arguments": []
  }' | grep -q "result" && echo "✅ get-name: Working" || echo "⚠️  get-name: Check manually"

echo ""

# Check SY token symbol
echo "2. Checking get-symbol..."
curl -s -X POST "${API_URL}/v2/contracts/call-read/${DEPLOYER}/sy-token/get-symbol" \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": "'${DEPLOYER}'",
    "arguments": []
  }' | grep -q "result" && echo "✅ get-symbol: Working" || echo "⚠️  get-symbol: Check manually"

echo ""

# Check decimals
echo "3. Checking get-decimals..."
curl -s -X POST "${API_URL}/v2/contracts/call-read/${DEPLOYER}/sy-token/get-decimals" \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": "'${DEPLOYER}'",
    "arguments": []
  }' | grep -q "result" && echo "✅ get-decimals: Working" || echo "⚠️  get-decimals: Check manually"

echo ""

# Check total supply
echo "4. Checking get-total-supply..."
curl -s -X POST "${API_URL}/v2/contracts/call-read/${DEPLOYER}/sy-token/get-total-supply" \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": "'${DEPLOYER}'",
    "arguments": []
  }' | grep -q "result" && echo "✅ get-total-supply: Working" || echo "⚠️  get-total-supply: Check manually"

echo ""

# Check exchange rate
echo "5. Checking get-exchange-rate..."
curl -s -X POST "${API_URL}/v2/contracts/call-read/${DEPLOYER}/sy-token/get-exchange-rate" \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": "'${DEPLOYER}'",
    "arguments": []
  }' | grep -q "result" && echo "✅ get-exchange-rate: Working" || echo "⚠️  get-exchange-rate: Check manually"

echo ""
echo ""

# Summary
echo "=========================================="
echo "VERIFICATION SUMMARY"
echo "=========================================="
echo ""

if [ $SIP_STATUS -eq 0 ] && [ $SY_STATUS -eq 0 ] && [ $PT_STATUS -eq 0 ]; then
    echo "✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY"
    echo ""
    echo "Contract Addresses:"
    echo "  • sip-010-trait: ${DEPLOYER}.sip-010-trait"
    echo "  • sy-token: ${DEPLOYER}.sy-token"
    echo "  • pt-yt-core: ${DEPLOYER}.pt-yt-core"
    echo ""
    echo "Explorer Links:"
    echo "  • SY Token: https://explorer.hiro.so/txid/${DEPLOYER}.sy-token?chain=mainnet"
    echo "  • PT/YT Core: https://explorer.hiro.so/txid/${DEPLOYER}.pt-yt-core?chain=mainnet"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 STAKIED PROTOCOL IS LIVE ON MAINNET!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 0
else
    echo "❌ SOME CONTRACTS FAILED VERIFICATION"
    echo "Please check the output above for details"
    exit 1
fi
