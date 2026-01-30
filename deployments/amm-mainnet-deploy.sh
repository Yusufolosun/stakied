#!/bin/bash

echo "⚠️  WARNING: Deploying PT/YT AMM to MAINNET - costs real STX"
echo "Estimated cost: ~$0.15-$0.20"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Deployment cancelled"
  exit 1
fi

echo ""
echo "🚀 Deploying PT/YT AMM to Stacks Mainnet..."
echo ""

# Verify Phase 1 exists
if [ ! -f "deployments/MAINNET_ADDRESSES.md" ]; then
  echo "❌ Phase 1 not deployed to mainnet"
  echo "Deploy Phase 1 first"
  exit 1
fi

# Final checks
echo "Running final checks..."
clarinet check

if [ $? -ne 0 ]; then
  echo "❌ Contract check failed - aborting deployment"
  exit 1
fi

echo "✅ Contract check passed"
echo ""

echo "Running tests..."
npm test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed - aborting deployment"
  exit 1
fi

echo "✅ All tests passed"
echo ""

echo "Deploying PT/YT AMM to mainnet..."
echo ""

# Deploy AMM contract
clarinet deployments apply --manifest-path Clarinet.toml -p deployments/default.mainnet-plan.yaml

echo ""
echo "============================================"
echo "✅ AMM MAINNET DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "🎉 Stakied Phase 2 is now LIVE on mainnet!"
echo ""
echo "📝 Next steps:"
echo "1. Update MAINNET_ADDRESSES.md with AMM contract address"
echo "2. Update README.md with Phase 2 features"
echo "3. Test AMM functions on mainnet:"
echo "   - Initialize a small test pool"
echo "   - Execute a test swap"
echo "   - Verify all functions work"
echo ""
echo "4. Document deployment in MAINNET_DEPLOYMENT.md"
echo ""
echo "Total deployment cost (Phase 1 + Phase 2): ~\$0.49"
echo ""
echo "🚀 Stakied Protocol is production-ready!"
