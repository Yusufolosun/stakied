#!/bin/bash

echo "🔍 Stakied Pre-Deployment Verification"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
passed=0
failed=0

echo "📦 Checking Project Structure..."

# Check if contracts exist
if [ -f "contracts/sy-token.clar" ] && [ -f "contracts/pt-yt-core.clar" ] && [ -f "contracts/traits/sip-010-trait.clar" ]; then
    echo -e "${GREEN}✓${NC} All contracts present"
    ((passed++))
else
    echo -e "${RED}✗${NC} Missing contract files"
    ((failed++))
fi

# Check if tests exist
if [ -f "tests/sy-token.test.ts" ] && [ -f "tests/pt-yt-core.test.ts" ]; then
    echo -e "${GREEN}✓${NC} Test files present"
    ((passed++))
else
    echo -e "${RED}✗${NC} Missing test files"
    ((failed++))
fi

# Check documentation
if [ -f "README.md" ] && [ -f "docs/ARCHITECTURE.md" ] && [ -f "CONTRIBUTING.md" ] && [ -f "LICENSE" ]; then
    echo -e "${GREEN}✓${NC} Documentation complete"
    ((passed++))
else
    echo -e "${RED}✗${NC} Missing documentation"
    ((failed++))
fi

# Check deployment files
if [ -f "deployments/testnet-deploy.sh" ] && [ -f "deployments/mainnet-deploy.sh" ]; then
    echo -e "${GREEN}✓${NC} Deployment scripts present"
    ((passed++))
else
    echo -e "${RED}✗${NC} Missing deployment scripts"
    ((failed++))
fi

echo ""
echo "🧪 Running Contract Validation..."

# Run clarinet check
if clarinet check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Contract syntax valid"
    ((passed++))
else
    echo -e "${RED}✗${NC} Contract validation failed"
    ((failed++))
fi

echo ""
echo "🧪 Running Tests..."

# Run tests
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} All tests passing"
    ((passed++))
else
    echo -e "${RED}✗${NC} Tests failing"
    ((failed++))
fi

echo ""
echo "🔒 Checking Security..."

# Check gitignore
if grep -q "Testnet.toml" .gitignore && grep -q "Mainnet.toml" .gitignore && grep -q ".env" .gitignore; then
    echo -e "${GREEN}✓${NC} Sensitive files protected in .gitignore"
    ((passed++))
else
    echo -e "${RED}✗${NC} Security issue: sensitive files not in .gitignore"
    ((failed++))
fi

# Check if sensitive files are not staged
if ! git ls-files | grep -q "settings/Testnet.toml" && ! git ls-files | grep -q "settings/Mainnet.toml"; then
    echo -e "${GREEN}✓${NC} No sensitive files tracked in Git"
    ((passed++))
else
    echo -e "${RED}✗${NC} Warning: Sensitive files tracked in Git!"
    ((failed++))
fi

echo ""
echo "⚙️  Checking Configuration..."

# Check if Testnet.toml exists
if [ -f "settings/Testnet.toml" ]; then
    if grep -q "<YOUR_TESTNET_WALLET_MNEMONIC>" settings/Testnet.toml; then
        echo -e "${YELLOW}⚠${NC}  Testnet.toml needs wallet mnemonic"
    else
        echo -e "${GREEN}✓${NC} Testnet.toml configured"
        ((passed++))
    fi
else
    echo -e "${RED}✗${NC} Testnet.toml missing"
    ((failed++))
fi

# Check if Mainnet.toml exists
if [ -f "settings/Mainnet.toml" ]; then
    if grep -q "<YOUR_MAINNET_WALLET_MNEMONIC>" settings/Mainnet.toml; then
        echo -e "${YELLOW}⚠${NC}  Mainnet.toml needs wallet mnemonic (for mainnet deployment)"
    else
        echo -e "${GREEN}✓${NC} Mainnet.toml configured"
    fi
else
    echo -e "${RED}✗${NC} Mainnet.toml missing"
    ((failed++))
fi

echo ""
echo "======================================"
echo -e "Results: ${GREEN}${passed} passed${NC}, ${RED}${failed} failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add your testnet wallet mnemonic to settings/Testnet.toml"
    echo "2. Get testnet STX: https://explorer.hiro.so/sandbox/faucet?chain=testnet"
    echo "3. Run: ./deployments/testnet-deploy.sh"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Fix issues before deploying${NC}"
    exit 1
fi
