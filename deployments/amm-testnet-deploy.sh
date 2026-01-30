#!/bin/bash

echo "🚀 Deploying PT/YT AMM to Stacks Testnet..."

# Verify Phase 1 contracts exist
echo "Checking Phase 1 deployment..."
if [ ! -f "deployments/TESTNET_ADDRESSES.md" ]; then
  echo "❌ Phase 1 contracts not deployed to testnet"
  echo "Run ./deployments/testnet-deploy.sh first"
  exit 1
fi

echo "✅ Phase 1 contracts verified"
echo ""
echo "Deploying PT/YT AMM contract..."
echo ""

# Deploy AMM contract
clarinet deployments apply --manifest-path Clarinet.toml -p deployments/default.testnet-plan.yaml

echo ""
echo "✅ AMM testnet deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Record AMM contract address in TESTNET_ADDRESSES.md"
echo "2. Test AMM functions on testnet"
echo "3. Verify all interactions work correctly"
echo ""
echo "Once verified, proceed to mainnet deployment with:"
echo "  ./deployments/amm-mainnet-deploy.sh"
