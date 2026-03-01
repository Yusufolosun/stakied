# Mainnet Deployment Guide

> ✅ **DEPLOYMENT COMPLETE — March 1, 2026**  
> All 10 contracts live. Deployer: `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z`  
> See [`deployments/MAINNET_ADDRESSES.md`](../deployments/MAINNET_ADDRESSES.md) for full contract addresses and TX IDs.

---

## ✅ Pre-Deployment Checklist (Completed)

- [x] All tests passing on testnet
- [x] Security review completed
- [x] Gas optimization done
- [x] Documentation finalized
- [x] STX funded in mainnet wallet
- [x] Backup of deployment keys

## Prerequisites

1. **Acquire STX**
   - Buy on Coinbase/Binance/OKX
   - ~2-4 STX (~$1.50-$3.00)

2. **Stacks Wallet**
   - Use Leather, Xverse, or Hiro
   - Backup seed phrase securely

3. **Clarinet**
   - Latest version installed
   - Tested on testnet first

## Deployment Process

### 1. Final Verification
```bash
clarinet check
clarinet test
```

All tests must pass before proceeding.

### 2. Deploy Contracts
```bash
chmod +x deployments/mainnet-deploy.sh
./deployments/mainnet-deploy.sh
```

Script will:
- Ask for confirmation
- Run final checks
- Deploy contracts sequentially
- Record addresses

### 3. Verify On-Chain
```bash
stacks-cli contract-call SP... sy-token get-name
stacks-cli contract-call SP... pt-yt-core get-pt-total-supply u0
```

### 4. Update Documentation
Update `README.md` and `deployments/MAINNET_ADDRESSES.md` with actual contract addresses.

## Post-Deployment

### 1. Test Basic Functions
- Deposit SY tokens
- Mint PT/YT
- Test redemption
- Verify all read-only functions

### 2. Announce Launch
- Twitter/X
- Discord communities            
- Stacks community channels

### 3. Monitor
- Watch for transactions
- Check for errors
- Respond to community questions
- Monitor contract balances

## Emergency Procedures

If critical bug found:
1. **Do NOT redeploy immediately**
2. Document the issue thoroughly
3. Fix in dev environment
4. Test extensively on testnet
5. Only then consider redeploying to mainnet

## Cost Management — Actual Results

| Contract | Fee (STX) | Fee (USD) |
|---|---|---|
| stakied-fee-vault | 0.733958 | ~$0.19 |
| stakied-governance | 0.734078 | ~$0.19 |
| stakied-liquidity-gauge | 0.734438 | ~$0.19 |
| stakied-oracle | 0.733928 | ~$0.19 |
| stakied-pt-yt-core | 0.734048 | ~$0.19 |
| stakied-sip-010-trait | 0.733268 | ~$0.19 |
| stakied-sy-token | 0.733658 | ~$0.19 |
| stakied-pt-yt-amm | 0.735068 | ~$0.19 |
| stakied-rewards-distributor | 0.734018 | ~$0.19 |
| stakied-staking-pool | 0.733988 | ~$0.19 |
| **Total (10 contracts)** | **7.340450 STX** | **~$1.90** |

## Security Best Practices

1. **Never share private keys**
2. **Use hardware wallet for deployment if possible**
3. **Keep deployment scripts in private until after deployment**
4. **Monitor contract activity for first 48 hours**
5. **Have emergency contact plan ready**

## Mainnet Configuration

Edit `settings/Mainnet.toml` (this file is gitignored):
```toml
[network]
name = "mainnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "YOUR_MAINNET_MNEMONIC"
```

**⚠️ NEVER commit this file to Git!**
