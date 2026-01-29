import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("PT/YT Core Tests", () => {
  describe("Read-Only Functions", () => {
    it("returns zero balances initially", () => {
      const maturity = 1000;
      
      const ptBalance = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        deployer
      );
      expect(ptBalance.result).toBeOk(Cl.uint(0));

      const ytBalance = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        deployer
      );
      expect(ytBalance.result).toBeOk(Cl.uint(0));
    });
  });

  describe("PT/YT Minting", () => {
    it("mints equal PT and YT tokens", () => {
      const maturity = 10000;
      
      const mint = simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      expect(mint.result).toBeOk(
        Cl.tuple({ pt: Cl.uint(1000000), yt: Cl.uint(1000000) })
      );

      const ptBalance = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ptBalance.result).toBeOk(Cl.uint(1000000));

      const ytBalance = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ytBalance.result).toBeOk(Cl.uint(1000000));
    });

    it("fails to mint with past maturity", () => {
      const pastMaturity = 1;
      
      const mint = simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(pastMaturity)],
        wallet1
      );

      expect(mint.result).toBeErr(Cl.uint(206)); // err-invalid-maturity
    });

    it("fails to mint zero amount", () => {
      const maturity = 10000;
      
      const mint = simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(0), Cl.uint(maturity)],
        wallet1
      );

      expect(mint.result).toBeErr(Cl.uint(202)); // err-invalid-amount
    });
  });

  describe("PT Redemption", () => {
    it("redeems PT after maturity", () => {
      const maturity = 100;
      
      // Mint PT/YT first
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      // Advance to maturity
      simnet.mineEmptyBlocks(maturity + 10);

      // Redeem PT
      const redeem = simnet.callPublicFn(
        "pt-yt-core",
        "redeem-matured-pt",
        [Cl.uint(500000), Cl.uint(maturity)],
        wallet1
      );

      expect(redeem.result).toBeOk(Cl.uint(500000));

      // Verify remaining balance
      const ptBalance = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ptBalance.result).toBeOk(Cl.uint(500000));
    });

    it("fails to redeem PT before maturity", () => {
      const maturity = 10000;
      
      // Mint PT/YT
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      // Try to redeem before maturity
      const redeem = simnet.callPublicFn(
        "pt-yt-core",
        "redeem-matured-pt",
        [Cl.uint(500000), Cl.uint(maturity)],
        wallet1
      );

      expect(redeem.result).toBeErr(Cl.uint(204)); // err-maturity-not-reached
    });

    it("fails with insufficient PT balance", () => {
      const maturity = 100;
      
      simnet.mineEmptyBlocks(maturity + 10);

      const redeem = simnet.callPublicFn(
        "pt-yt-core",
        "redeem-matured-pt",
        [Cl.uint(500000), Cl.uint(maturity)],
        wallet1
      );

      expect(redeem.result).toBeErr(Cl.uint(203)); // err-insufficient-balance
    });
  });

  describe("PT+YT Recombination", () => {
    it("recombines PT+YT to get SY anytime", () => {
      const maturity = 10000;
      
      // Mint PT/YT
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      // Recombine without waiting for maturity
      const recombine = simnet.callPublicFn(
        "pt-yt-core",
        "redeem-pt-yt",
        [Cl.uint(600000), Cl.uint(maturity)],
        wallet1
      );

      expect(recombine.result).toBeOk(Cl.uint(600000));

      // Verify balances decreased
      const ptBalance = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ptBalance.result).toBeOk(Cl.uint(400000));

      const ytBalance = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ytBalance.result).toBeOk(Cl.uint(400000));
    });

    it("fails with insufficient PT", () => {
      const maturity = 10000;
      
      // Mint minimal PT/YT
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(100000), Cl.uint(maturity)],
        wallet1
      );

      // Try to recombine more than available
      const recombine = simnet.callPublicFn(
        "pt-yt-core",
        "redeem-pt-yt",
        [Cl.uint(200000), Cl.uint(maturity)],
        wallet1
      );

      expect(recombine.result).toBeErr(Cl.uint(203)); // err-insufficient-balance
    });
  });

  describe("YT Yield Claiming", () => {
    it("allows YT holders to claim yield", () => {
      const maturity = 10000;
      
      // Mint YT
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      // Claim yield
      const claim = simnet.callPublicFn(
        "pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      expect(claim.result).toBeOk(Cl.uint(8000000)); // 1000000 * 8
    });

    it("prevents double claiming", () => {
      const maturity = 10000;
      
      // Mint YT
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      // First claim
      simnet.callPublicFn(
        "pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      // Second claim should fail (no more claimable)
      const claim2 = simnet.callPublicFn(
        "pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      expect(claim2.result).toBeErr(Cl.uint(202)); // err-invalid-amount
    });

    it("fails to claim with no YT balance", () => {
      const maturity = 10000;
      
      const claim = simnet.callPublicFn(
        "pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      expect(claim.result).toBeErr(Cl.uint(202)); // err-invalid-amount
    });
  });

  describe("Multiple Maturities", () => {
    it("handles multiple maturities independently", () => {
      const maturity1 = 1000;
      const maturity2 = 2000;
      
      // Mint for first maturity
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity1)],
        wallet1
      );

      // Mint for second maturity
      simnet.callPublicFn(
        "pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(2000000), Cl.uint(maturity2)],
        wallet1
      );

      // Verify independent balances
      const pt1 = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity1)],
        wallet1
      );
      expect(pt1.result).toBeOk(Cl.uint(1000000));

      const pt2 = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity2)],
        wallet1
      );
      expect(pt2.result).toBeOk(Cl.uint(2000000));

      const yt1 = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity1)],
        wallet1
      );
      expect(yt1.result).toBeOk(Cl.uint(1000000));

      const yt2 = simnet.callReadOnlyFn(
        "pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity2)],
        wallet1
      );
      expect(yt2.result).toBeOk(Cl.uint(2000000));
    });
  });
});
