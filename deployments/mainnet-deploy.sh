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
clarinet check
clarinet test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed - aborting deployment"
  exit 1
fi

# Deploy SIP-010 trait
echo "Deploying SIP-010 trait..."
clarinet deployments apply -p mainnet --contracts sip-010-trait

# Deploy SY Token
echo "Deploying SY Token..."
clarinet deployments apply -p mainnet --contracts sy-token

# Deploy PT/YT Core
echo "Deploying PT/YT Core..."
clarinet deployments apply -p mainnet --contracts pt-yt-core

echo "✅ MAINNET DEPLOYMENT COMPLETE!"
echo "🎉 Stakied is now live on Stacks!"
echo "Check addresses in deployments/MAINNET_ADDRESSES.md"
