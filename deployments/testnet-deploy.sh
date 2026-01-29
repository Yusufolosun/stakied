#!/bin/bash

echo "🚀 Deploying Stakied to Stacks Testnet..."

# Deploy all contracts to testnet using default testnet deployment plan
echo "Deploying contracts..."
clarinet deployments apply --testnet

echo "✅ Testnet deployment complete!"
echo "Check transaction details in the output above"
