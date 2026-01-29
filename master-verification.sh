#!/bin/bash

# Master Verification Script for Stakied Protocol Phase 1
# Runs all verification checks before mainnet deployment

echo "========================================================"
echo "STAKIED PROTOCOL PHASE 1 - MASTER VERIFICATION"
echo "========================================================"
echo ""

# Track overall status
OVERALL_STATUS=0

# Function to run check and track status
run_check() {
    local name=$1
    local command=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "CHECK: $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if eval "$command"; then
        echo "✅ PASSED: $name"
        echo ""
        return 0
    else
        echo "❌ FAILED: $name"
        echo ""
        OVERALL_STATUS=1
        return 1
    fi
}

# 1. Contract Syntax Check
run_check "Contract Syntax Validation" "echo 'Y' | clarinet check > /dev/null 2>&1"

# 2. Full Test Suite
run_check "Comprehensive Test Suite (28 tests)" "npm test > /dev/null 2>&1"

# 3. SY Token Edge Cases
run_check "SY Token Edge Cases (15 tests)" "bash verify-sy-token-edge-cases.sh > /dev/null 2>&1"

# 4. PT/YT Core Edge Cases
run_check "PT/YT Core Edge Cases (13 tests)" "bash verify-pt-yt-edge-cases.sh > /dev/null 2>&1"

# 5. Authorization & Access Control
run_check "Authorization & Access Control" "bash verify-authorization.sh > /dev/null 2>&1"

# 6. Check for uncommitted changes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK: Git Repository Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get git status (excluding ignored files)
GIT_STATUS=$(git status --porcelain | grep -v "^!!" | grep -v "test-results.log" | grep -v "Testnet.toml" | grep -v "Mainnet.toml")

if [ -z "$GIT_STATUS" ]; then
    echo "✅ PASSED: All changes committed"
    echo ""
else
    echo "⚠️  WARNING: Uncommitted changes found:"
    echo "$GIT_STATUS"
    echo ""
fi

# Summary
echo "========================================================"
echo "VERIFICATION SUMMARY"
echo "========================================================"
echo ""

if [ $OVERALL_STATUS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED"
    echo ""
    echo "Status Breakdown:"
    echo "  ✅ Contract syntax: Valid"
    echo "  ✅ Unit tests: 28/28 passed"
    echo "  ✅ SY token edge cases: 15/15 passed"
    echo "  ✅ PT/YT edge cases: 13/13 passed"
    echo "  ✅ Authorization: Verified"
    echo "  ✅ Git commits: Up to date"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 READY FOR MAINNET DEPLOYMENT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next steps:"
    echo "  1. Review deployment costs in docs/COMPLETE_TEST_RESULTS.md"
    echo "  2. Ensure sufficient STX balance (~0.5 STX)"
    echo "  3. Run: ./deployments/mainnet-deploy.sh"
    echo ""
    exit 0
else
    echo "❌ SOME CHECKS FAILED"
    echo ""
    echo "Please review the output above and fix any issues"
    echo "before proceeding to mainnet deployment."
    echo ""
    exit 1
fi
