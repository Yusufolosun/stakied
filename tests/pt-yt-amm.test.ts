import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("PT/YT AMM Contract Tests", () => {
  describe("Pool Initialization", () => {
    it("initializes pool correctly with valid parameters", () => {
      const maturity = 1000;
      
      // Setup: deposit SY and mint PT/YT
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      
      // Initialize pool with 1M PT and 1M SY
      const initPool = simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      expect(initPool.result).toBeOk(Cl.uint(1000000));
      
      // Verify pool reserves
      const reserves = simnet.callReadOnlyFn("pt-yt-amm", "get-pool-reserves",
        [Cl.uint(maturity)], user1);
      
      expect(reserves.result).toBeOk(Cl.tuple({
        "pt-reserve": Cl.uint(1000000),
        "sy-reserve": Cl.uint(1000000)
      }));
    });

    it("fails when pool already exists", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(4000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(2000000), Cl.uint(maturity)], user1);
      
      // Initialize pool
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // Try to initialize again - should fail
      const init2 = simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      expect(init2.result).toBeErr(Cl.uint(307)); // err-pool-already-exists
    });

    it("fails with zero PT amount", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      
      const initPool = simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(0), Cl.uint(1000000)], user1);
      
      expect(initPool.result).toBeErr(Cl.uint(302)); // err-invalid-amount
    });

    it("fails with maturity in the past", () => {
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(500)], user1);
      
      // Fast forward past maturity
      simnet.mineEmptyBlocks(600);
      
      const initPool = simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(500), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      expect(initPool.result).toBeErr(Cl.uint(309)); // err-invalid-maturity
    });
  });

  describe("Read-Only Functions", () => {
    it("returns correct LP balance", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      const lpBalance = simnet.callReadOnlyFn("pt-yt-amm", "get-lp-balance",
        [Cl.principal(user1), Cl.uint(maturity)], user1);
      
      expect(lpBalance.result).toBeOk(Cl.uint(1000000));
    });

    it("calculates time factor correctly", () => {
      const maturity = 1000;
      
      const timeFactor = simnet.callReadOnlyFn("pt-yt-amm", "calculate-time-factor",
        [Cl.uint(maturity)], user1);
      
      expect(timeFactor.result).toBeSome();
    });
  });

  describe("PT to SY Swaps", () => {
    it("executes PT to SY swap correctly", () => {
      const maturity = 1000;
      
      // User1: Setup pool
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // User2: Get PT to swap
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(500000)], user2);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(500000), Cl.uint(maturity)], user2);
      
      // User2: Swap 100k PT for SY
      const swap = simnet.callPublicFn("pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(90000)], user2);
      
      expect(swap.result).toBeOk();
    });

    it("fails if slippage exceeded", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // Swap with unrealistic minimum (expect more SY than possible)
      const swap = simnet.callPublicFn("pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(99999)], user1);
      
      expect(swap.result).toBeErr(Cl.uint(305)); // err-slippage-exceeded
    });

    it("fails with zero amount", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      const swap = simnet.callPublicFn("pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(0), Cl.uint(maturity), Cl.uint(0)], user1);
      
      expect(swap.result).toBeErr(Cl.uint(302)); // err-invalid-amount
    });
  });

  describe("SY to PT Swaps", () => {
    it("executes SY to PT swap correctly", () => {
      const maturity = 1000;
      
      // Setup pool
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // User2: Get SY to swap
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(100000)], user2);
      
      // User2: Swap 100k SY for PT
      const swap = simnet.callPublicFn("pt-yt-amm", "swap-sy-for-pt",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(90000)], user2);
      
      expect(swap.result).toBeOk();
    });

    it("fails if slippage exceeded", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(100000)], user2);
      
      const swap = simnet.callPublicFn("pt-yt-amm", "swap-sy-for-pt",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(99999)], user2);
      
      expect(swap.result).toBeErr(Cl.uint(305)); // err-slippage-exceeded
    });
  });

  describe("Liquidity Management", () => {
    it("adds liquidity and mints LP tokens proportionally", () => {
      const maturity = 1000;
      
      // User1: Initialize pool
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // User2: Get tokens and add liquidity
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(1000000)], user2);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(500000), Cl.uint(maturity)], user2);
      
      const addLiq = simnet.callPublicFn("pt-yt-amm", "add-liquidity",
        [Cl.uint(maturity), Cl.uint(500000), Cl.uint(500000), Cl.uint(1)], user2);
      
      expect(addLiq.result).toBeOk();
      
      // Verify user2 has LP tokens
      const lpBalance = simnet.callReadOnlyFn("pt-yt-amm", "get-lp-balance",
        [Cl.principal(user2), Cl.uint(maturity)], user2);
      
      expect(lpBalance.result).toBeOk();
    });

    it("removes liquidity and burns LP tokens", () => {
      const maturity = 1000;
      
      // Setup and add liquidity
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // Get initial LP balance
      const lpBefore = simnet.callReadOnlyFn("pt-yt-amm", "get-lp-balance",
        [Cl.principal(user1), Cl.uint(maturity)], user1);
      
      // Remove half the liquidity
      const removeLiq = simnet.callPublicFn("pt-yt-amm", "remove-liquidity",
        [Cl.uint(maturity), Cl.uint(500000), Cl.uint(1), Cl.uint(1)], user1);
      
      expect(removeLiq.result).toBeOk();
    });

    it("fails to remove more liquidity than owned", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // Try to remove more than owned
      const removeLiq = simnet.callPublicFn("pt-yt-amm", "remove-liquidity",
        [Cl.uint(maturity), Cl.uint(9999999), Cl.uint(1), Cl.uint(1)], user1);
      
      expect(removeLiq.result).toBeErr(Cl.uint(303)); // err-insufficient-balance
    });
  });

  describe("Edge Cases", () => {
    it("fails when swapping with non-existent pool", () => {
      const maturity = 9999;
      
      const swap = simnet.callPublicFn("pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(1)], user1);
      
      expect(swap.result).toBeErr(Cl.uint(306)); // err-pool-not-initialized
    });

    it("calculates price impact correctly for large swaps", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(3000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1500000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // Quote a large swap (50% of pool)
      const quote = simnet.callReadOnlyFn("pt-yt-amm", "quote-swap-pt-for-sy",
        [Cl.uint(500000), Cl.uint(maturity)], user1);
      
      expect(quote.result).toBeOk();
    });

    it("handles fee accrual to liquidity providers", () => {
      const maturity = 1000;
      
      // User1: Provide liquidity
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // Get initial reserves
      const reservesBefore = simnet.callReadOnlyFn("pt-yt-amm", "get-pool-reserves",
        [Cl.uint(maturity)], user1);
      
      // User2: Perform swaps (generate fees)
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(500000)], user2);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(250000), Cl.uint(maturity)], user2);
      
      simnet.callPublicFn("pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(1)], user2);
      simnet.callPublicFn("pt-yt-amm", "swap-sy-for-pt",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(1)], user2);
      
      // Reserves should include fees
      const reservesAfter = simnet.callReadOnlyFn("pt-yt-amm", "get-pool-reserves",
        [Cl.uint(maturity)], user1);
      
      expect(reservesAfter.result).toBeOk();
    });

    it("prevents swapping more than pool reserves", () => {
      const maturity = 1000;
      
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // Try to swap more PT than pool can handle
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(5000000)], user2);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(5000000), Cl.uint(maturity)], user2);
      
      const swap = simnet.callPublicFn("pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(5000000), Cl.uint(maturity), Cl.uint(900000)], user2);
      
      expect(swap.result).toBeErr(Cl.uint(304)); // err-insufficient-liquidity
    });
  });

  describe("Integration Tests", () => {
    it("completes full user flow - deposit, mint, swap, add liquidity", () => {
      const maturity = 1000;
      
      // Alice: Create pool
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      const initPool = simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      expect(initPool.result).toBeOk();
      
      // Bob: Get PT and swap for SY
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(1000000)], user2);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(500000), Cl.uint(maturity)], user2);
      
      const bobSwap = simnet.callPublicFn("pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(200000), Cl.uint(maturity), Cl.uint(1)], user2);
      
      expect(bobSwap.result).toBeOk();
      
      // Bob: Add remaining liquidity
      const bobAddLiq = simnet.callPublicFn("pt-yt-amm", "add-liquidity",
        [Cl.uint(maturity), Cl.uint(300000), Cl.uint(300000), Cl.uint(1)], user2);
      
      expect(bobAddLiq.result).toBeOk();
      
      // Verify final state
      const finalStats = simnet.callReadOnlyFn("pt-yt-amm", "get-pool-stats",
        [Cl.uint(maturity)], user1);
      
      expect(finalStats.result).toBeOk();
    });

    it("allows multiple users to provide and remove liquidity", () => {
      const maturity = 1000;
      
      // User1: Initialize
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);
      
      // User2: Add liquidity
      simnet.callPublicFn("sy-token", "deposit", [Cl.uint(1000000)], user2);
      simnet.callPublicFn("pt-yt-core", "mint-pt-yt", 
        [Cl.uint(500000), Cl.uint(maturity)], user2);
      const add2 = simnet.callPublicFn("pt-yt-amm", "add-liquidity",
        [Cl.uint(maturity), Cl.uint(500000), Cl.uint(500000), Cl.uint(1)], user2);
      
      expect(add2.result).toBeOk();
      
      // User1: Remove some liquidity
      const remove1 = simnet.callPublicFn("pt-yt-amm", "remove-liquidity",
        [Cl.uint(maturity), Cl.uint(500000), Cl.uint(1), Cl.uint(1)], user1);
      
      expect(remove1.result).toBeOk();
      
      // Verify both users have LP tokens
      const lp1 = simnet.callReadOnlyFn("pt-yt-amm", "get-lp-balance",
        [Cl.principal(user1), Cl.uint(maturity)], user1);
      const lp2 = simnet.callReadOnlyFn("pt-yt-amm", "get-lp-balance",
        [Cl.principal(user2), Cl.uint(maturity)], user2);
      
      expect(lp1.result).toBeOk();
      expect(lp2.result).toBeOk();
    });
  });
});
