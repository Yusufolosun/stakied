#!/bin/bash

echo "🧪 Testing Stakied Testnet Deployment"
echo "======================================"
echo ""

DEPLOYER="ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0"
TESTNET_API="https://api.testnet.hiro.so"

echo "📍 Deployer Address: $DEPLOYER"
echo "🌐 Network: Testnet"
echo ""

# Test 1: SY Token - get-name
echo "Test 1: SY Token - get-name"
curl -s -X POST "$TESTNET_API/v2/contracts/call-read/$DEPLOYER/sy-token/get-name" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$DEPLOYER'","arguments":[]}'
echo -e "\n"

# Test 2: SY Token - get-symbol  
echo "Test 2: SY Token - get-symbol"
curl -s -X POST "$TESTNET_API/v2/contracts/call-read/$DEPLOYER/sy-token/get-symbol" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$DEPLOYER'","arguments":[]}'
echo -e "\n"

# Test 3: SY Token - get-decimals
echo "Test 3: SY Token - get-decimals"
curl -s -X POST "$TESTNET_API/v2/contracts/call-read/$DEPLOYER/sy-token/get-decimals" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$DEPLOYER'","arguments":[]}'
echo -e "\n"

# Test 4: SY Token - get-total-supply
echo "Test 4: SY Token - get-total-supply"
curl -s -X POST "$TESTNET_API/v2/contracts/call-read/$DEPLOYER/sy-token/get-total-supply" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$DEPLOYER'","arguments":[]}'
echo -e "\n"

# Test 5: SY Token - get-exchange-rate
echo "Test 5: SY Token - get-exchange-rate"
curl -s -X POST "$TESTNET_API/v2/contracts/call-read/$DEPLOYER/sy-token/get-exchange-rate" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$DEPLOYER'","arguments":[]}'
echo -e "\n"

# Test 6: PT/YT Core - get-pt-balance
echo "Test 6: PT/YT Core - get-pt-balance (user=$DEPLOYER, maturity=1000)"
curl -s -X POST "$TESTNET_API/v2/contracts/call-read/$DEPLOYER/pt-yt-core/get-pt-balance" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$DEPLOYER'","arguments":["0x0516'${DEPLOYER:2}'","0x0100000000000003e8"]}'
echo -e "\n"

# Test 7: PT/YT Core - get-yt-balance
echo "Test 7: PT/YT Core - get-yt-balance (user=$DEPLOYER, maturity=1000)"
curl -s -X POST "$TESTNET_API/v2/contracts/call-read/$DEPLOYER/pt-yt-core/get-yt-balance" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$DEPLOYER'","arguments":["0x0516'${DEPLOYER:2}'","0x0100000000000003e8"]}'
echo -e "\n"

echo "✅ Basic read-only tests complete!"
echo ""
echo "Next: Test write functions (deposit, mint-pt-yt) via Stacks wallet or explorer"
