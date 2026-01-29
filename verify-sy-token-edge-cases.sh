#!/bin/bash

# SY Token Edge Case Verification Script
# Tests all critical edge cases for SY token contract

echo "=================================="
echo "SY TOKEN EDGE CASE VERIFICATION"
echo "=================================="
echo ""

# Run targeted tests for SY token
echo "Running SY Token test suite..."
npm test -- sy-token.test.ts

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ALL SY TOKEN EDGE CASES PASSED"
    echo ""
    echo "Verified edge cases:"
    echo "  ✅ Zero amount deposit prevention"
    echo "  ✅ Zero amount redeem prevention"
    echo "  ✅ Zero amount transfer prevention"
    echo "  ✅ Insufficient balance redeem prevention"
    echo "  ✅ Insufficient balance transfer prevention"
    echo "  ✅ Owner-only exchange rate update"
    echo "  ✅ Non-owner exchange rate update prevention"
    echo "  ✅ Correct token metadata"
    echo "  ✅ Deposit/mint functionality"
    echo "  ✅ Redeem/burn functionality"
    echo "  ✅ Transfer functionality"
    echo ""
else
    echo ""
    echo "❌ SOME SY TOKEN TESTS FAILED"
    echo "Review output above for details"
    exit 1
fi
