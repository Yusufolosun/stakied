#!/bin/bash

echo "⚠️  WARNING: Deploying to MAINNET - costs real STX"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Deployment cancelled"
  exit 1
fi

echo "🚀 Deploying Stakied to Stacks Mainnet..."

# Final checks
echo "Running final checks..."
echo "Y" | clarinet check

if [ $? -ne 0 ]; then
  echo "❌ Contract validation failed - aborting deployment"
  exit 1
fi

npm test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed - aborting deployment"
  exit 1
fi

# Deploy all contracts to mainnet
echo "Deploying contracts..."
clarinet deployments apply --mainnet

echo "✅ MAINNET DEPLOYMENT COMPLETE!"
echo "🎉 Stakied is now live on Stacks!"
echo "Check transaction details in the output above"
