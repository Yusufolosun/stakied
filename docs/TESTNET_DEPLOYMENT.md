# Testnet Deployment Guide

## Prerequisites

1. **Stacks wallet** (Leather/Xverse/Hiro)
2. **Testnet STX** from faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
3. **Clarinet** installed

## Deployment Steps

### 1. Get Testnet STX
Visit the faucet and request 500 testnet STX

### 2. Configure Wallet
Add your testnet wallet details to `settings/Testnet.toml` (this file is gitignored)

### 3. Deploy Contracts
```bash
chmod +x deployments/testnet-deploy.sh
./deployments/testnet-deploy.sh
```

### 4. Verify Deployment
```bash
# Check contract deployment
clarinet deployments check testnet
```

## Testing on Testnet

### Deposit SY
```bash
stacks-cli contract-call ST... sy-token deposit u1000000
```

### Mint PT/YT
```bash
stacks-cli contract-call ST... pt-yt-core mint-pt-yt u1000000 u100000
```

### Check Balances
```bash
stacks-cli contract-call ST... sy-token get-balance 'ST...'
stacks-cli contract-call ST... pt-yt-core get-pt-balance 'ST...' u100000
```

## Troubleshooting

**Issue:** Deployment fails with "insufficient balance"
**Solution:** Request more testnet STX from faucet

**Issue:** Contract already exists
**Solution:** Use different deployer address or increment nonce

**Issue:** Transaction stuck pending
**Solution:** Wait a few minutes, testnet can be slow. Check explorer.hiro.so for status.

## Next Steps

After successful testnet deployment and testing:
1. Verify all functions work as expected
2. Test edge cases manually
3. Document any issues found
4. Prepare for mainnet deployment
