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

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);

      const initPool = simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      expect(initPool.result).toBeOk(Cl.uint(1000000));

      const reserves = simnet.callReadOnlyFn("stakied-pt-yt-amm", "get-pool-reserves",
        [Cl.uint(maturity)], user1);

      expect(reserves.result).toBeOk(Cl.tuple({
        "pt-reserve": Cl.uint(1000000),
        "sy-reserve": Cl.uint(1000000)
      }));
    });

    it("fails when pool already exists", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(4000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(2000000), Cl.uint(maturity)], user1);

      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      const init2 = simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      expect(init2.result).toBeErr(Cl.uint(307));
    });

    it("fails with zero PT amount", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);

      const initPool = simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(0), Cl.uint(1000000)], user1);

      expect(initPool.result).toBeErr(Cl.uint(302));
    });

    it("fails with zero SY amount", () => {
      const maturity = 1000;

      const initPool = simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(0)], user1);

      expect(initPool.result).toBeErr(Cl.uint(302));
    });

    it("fails with maturity in the past", () => {
      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(500)], user1);

      simnet.mineEmptyBlocks(600);

      const initPool = simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(500), Cl.uint(1000000), Cl.uint(1000000)], user1);

      expect(initPool.result).toBeErr(Cl.uint(309));
    });
  });

  describe("Read-Only Functions", () => {
    it("returns correct LP balance", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      const lpBalance = simnet.callReadOnlyFn("stakied-pt-yt-amm", "get-lp-balance",
        [Cl.principal(user1), Cl.uint(maturity)], user1);

      expect(lpBalance.result).toBeOk(Cl.uint(1000000));
    });

    it("returns zero LP balance for non-provider", () => {
      const maturity = 1000;

      const lpBalance = simnet.callReadOnlyFn("stakied-pt-yt-amm", "get-lp-balance",
        [Cl.principal(user2), Cl.uint(maturity)], user2);

      expect(lpBalance.result).toBeOk(Cl.uint(0));
    });
  });

  describe("PT to SY Swaps", () => {
    it("executes PT to SY swap correctly", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(500000)], user2);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(500000), Cl.uint(maturity)], user2);

      const swap = simnet.callPublicFn("stakied-pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(1)], user2);

      expect(swap.result).toBeOk(true);
    });

    it("fails if slippage exceeded", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      const swap = simnet.callPublicFn("stakied-pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(99999)], user1);

      expect(swap.result).toBeErr(Cl.uint(305));
    });

    it("fails with zero amount", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      const swap = simnet.callPublicFn("stakied-pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(0), Cl.uint(maturity), Cl.uint(0)], user1);

      expect(swap.result).toBeErr(Cl.uint(302));
    });
  });

  describe("SY to PT Swaps", () => {
    it("executes SY to PT swap correctly", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(100000)], user2);

      const swap = simnet.callPublicFn("stakied-pt-yt-amm", "swap-sy-for-pt",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(1)], user2);

      expect(swap.result).toBeOk(true);
    });

    it("fails if slippage exceeded", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(100000)], user2);

      const swap = simnet.callPublicFn("stakied-pt-yt-amm", "swap-sy-for-pt",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(99999)], user2);

      expect(swap.result).toBeErr(Cl.uint(305));
    });
  });

  describe("Liquidity Management", () => {
    it("fails to remove more liquidity than owned", () => {
      const maturity = 1000;

      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(2000000)], user1);
      simnet.callPublicFn("stakied-pt-yt-core", "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)], user1);
      simnet.callPublicFn("stakied-pt-yt-amm", "initialize-pool",
        [Cl.uint(maturity), Cl.uint(1000000), Cl.uint(1000000)], user1);

      const removeLiq = simnet.callPublicFn("stakied-pt-yt-amm", "remove-liquidity",
        [Cl.uint(maturity), Cl.uint(9999999), Cl.uint(1), Cl.uint(1)], user1);

      expect(removeLiq.result).toBeErr(Cl.uint(303));
    });
  });

  describe("Edge Cases", () => {
    it("fails when swapping with non-existent pool", () => {
      const maturity = 9999;

      const swap = simnet.callPublicFn("stakied-pt-yt-amm", "swap-pt-for-sy",
        [Cl.uint(100000), Cl.uint(maturity), Cl.uint(1)], user1);

      expect(swap.result).toBeErr(Cl.uint(306));
    });
  });
});
