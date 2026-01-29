#!/bin/bash

echo "🚀 Deploying Stakied to Stacks Testnet..."

# Deploy SIP-010 trait
echo "Deploying SIP-010 trait..."
clarinet deployments apply -p testnet --contracts sip-010-trait

# Deploy SY Token
echo "Deploying SY Token..."
clarinet deployments apply -p testnet --contracts sy-token

# Deploy PT/YT Core
echo "Deploying PT/YT Core..."
clarinet deployments apply -p testnet --contracts pt-yt-core

echo "✅ Testnet deployment complete!"
echo "Check addresses in deployments/testnet folder"
