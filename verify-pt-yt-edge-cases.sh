#!/bin/bash

# PT/YT Core Edge Case Verification Script
# Tests all critical edge cases for PT/YT core contract

echo "=================================="
echo "PT/YT CORE EDGE CASE VERIFICATION"
echo "=================================="
echo ""

# Run targeted tests for PT/YT core
echo "Running PT/YT Core test suite..."
npm test -- pt-yt-core.test.ts

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ALL PT/YT CORE EDGE CASES PASSED"
    echo ""
    echo "Verified edge cases:"
    echo "  ✅ Equal PT/YT minting (1:1 ratio)"
    echo "  ✅ PT redemption after maturity"
    echo "  ✅ PT redemption prevention before maturity"
    echo "  ✅ PT+YT recombination anytime"
    echo "  ✅ Insufficient PT balance prevention"
    echo "  ✅ Insufficient YT balance prevention"
    echo "  ✅ YT yield claiming"
    echo "  ✅ Double claim prevention"
    echo "  ✅ Multiple maturity handling"
    echo "  ✅ Independent maturity redemption"
    echo "  ✅ Zero amount minting prevention"
    echo "  ✅ Yield claim without YT prevention"
    echo "  ✅ Claimable yield calculation"
    echo ""
else
    echo ""
    echo "❌ SOME PT/YT CORE TESTS FAILED"
    echo "Review output above for details"
    exit 1
fi
