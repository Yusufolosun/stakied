import { describe, expect, it } from "vitest";

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
});
