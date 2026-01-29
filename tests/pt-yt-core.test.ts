import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

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
});
