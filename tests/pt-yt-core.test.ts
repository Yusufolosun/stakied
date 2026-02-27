import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("PT/YT Core Tests", () => {
  describe("Read-Only Functions", () => {
    it("returns zero balances initially", () => {
      const maturity = 1000;

      const ptBalance = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        deployer
      );
      expect(ptBalance.result).toBeOk(Cl.uint(0));

      const ytBalance = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        deployer
      );
      expect(ytBalance.result).toBeOk(Cl.uint(0));
    });

    it("returns zero total supply initially", () => {
      const maturity = 1000;

      const ptSupply = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-total-supply",
        [Cl.uint(maturity)],
        deployer
      );
      expect(ptSupply.result).toBeOk(Cl.uint(0));

      const ytSupply = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-yt-total-supply",
        [Cl.uint(maturity)],
        deployer
      );
      expect(ytSupply.result).toBeOk(Cl.uint(0));
    });
  });

  describe("PT/YT Minting", () => {
    it("mints equal PT and YT tokens", () => {
      const maturity = 10000;

      const mint = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      expect(mint.result).toBeOk(
        Cl.tuple({ pt: Cl.uint(1000000), yt: Cl.uint(1000000) })
      );

      const ptBalance = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ptBalance.result).toBeOk(Cl.uint(1000000));

      const ytBalance = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ytBalance.result).toBeOk(Cl.uint(1000000));
    });

    it("fails to mint with past maturity", () => {
      const pastMaturity = 1;

      const mint = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(pastMaturity)],
        wallet1
      );

      expect(mint.result).toBeErr(Cl.uint(206));
    });

    it("fails to mint zero amount", () => {
      const maturity = 10000;

      const mint = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(0), Cl.uint(maturity)],
        wallet1
      );

      expect(mint.result).toBeErr(Cl.uint(202));
    });

    it("updates total supply on mint", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(500000), Cl.uint(maturity)],
        wallet1
      );

      const ptSupply = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-total-supply",
        [Cl.uint(maturity)],
        wallet1
      );
      expect(ptSupply.result).toBeOk(Cl.uint(500000));
    });
  });

  describe("PT Redemption", () => {
    it("redeems PT after maturity", () => {
      const maturity = 100;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      simnet.mineEmptyBlocks(maturity + 10);

      const redeem = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "redeem-matured-pt",
        [Cl.uint(500000), Cl.uint(maturity)],
        wallet1
      );

      expect(redeem.result).toBeOk(Cl.uint(500000));

      const ptBalance = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ptBalance.result).toBeOk(Cl.uint(500000));
    });

    it("fails to redeem PT before maturity", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      const redeem = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "redeem-matured-pt",
        [Cl.uint(500000), Cl.uint(maturity)],
        wallet1
      );

      expect(redeem.result).toBeErr(Cl.uint(204));
    });

    it("fails with insufficient PT balance", () => {
      const maturity = 100;

      simnet.mineEmptyBlocks(maturity + 10);

      const redeem = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "redeem-matured-pt",
        [Cl.uint(500000), Cl.uint(maturity)],
        wallet1
      );

      expect(redeem.result).toBeErr(Cl.uint(203));
    });

    it("fails to redeem zero amount", () => {
      const maturity = 100;

      simnet.mineEmptyBlocks(maturity + 10);

      const redeem = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "redeem-matured-pt",
        [Cl.uint(0), Cl.uint(maturity)],
        wallet1
      );

      expect(redeem.result).toBeErr(Cl.uint(202));
    });
  });

  describe("PT+YT Recombination", () => {
    it("recombines PT+YT to get SY anytime", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      const recombine = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "redeem-pt-yt",
        [Cl.uint(600000), Cl.uint(maturity)],
        wallet1
      );

      expect(recombine.result).toBeOk(Cl.uint(600000));

      const ptBalance = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ptBalance.result).toBeOk(Cl.uint(400000));

      const ytBalance = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-yt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(ytBalance.result).toBeOk(Cl.uint(400000));
    });

    it("fails with insufficient PT", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(100000), Cl.uint(maturity)],
        wallet1
      );

      const recombine = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "redeem-pt-yt",
        [Cl.uint(200000), Cl.uint(maturity)],
        wallet1
      );

      expect(recombine.result).toBeErr(Cl.uint(203));
    });
  });

  describe("YT Yield Claiming", () => {
    it("allows YT holders to claim yield", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      const claim = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      expect(claim.result).toBeOk(Cl.uint(8000000));
    });

    it("prevents double claiming", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      const claim2 = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      expect(claim2.result).toBeErr(Cl.uint(202));
    });

    it("fails to claim with no YT balance", () => {
      const maturity = 10000;

      const claim = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "claim-yield",
        [Cl.uint(maturity)],
        wallet1
      );

      expect(claim.result).toBeErr(Cl.uint(202));
    });
  });

  describe("PT Transfer", () => {
    it("transfers PT tokens between users", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      const transfer = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "transfer-pt",
        [Cl.uint(300000), Cl.uint(maturity), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(transfer.result).toBeOk(Cl.bool(true));

      const bal1 = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity)],
        wallet1
      );
      expect(bal1.result).toBeOk(Cl.uint(700000));

      const bal2 = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet2), Cl.uint(maturity)],
        wallet2
      );
      expect(bal2.result).toBeOk(Cl.uint(300000));
    });

    it("prevents unauthorized PT transfer", () => {
      const maturity = 10000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity)],
        wallet1
      );

      const transfer = simnet.callPublicFn(
        "stakied-pt-yt-core",
        "transfer-pt",
        [Cl.uint(100000), Cl.uint(maturity), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet2
      );

      expect(transfer.result).toBeErr(Cl.uint(201));
    });
  });

  describe("Multiple Maturities", () => {
    it("handles multiple maturities independently", () => {
      const maturity1 = 1000;
      const maturity2 = 2000;

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(1000000), Cl.uint(maturity1)],
        wallet1
      );

      simnet.callPublicFn(
        "stakied-pt-yt-core",
        "mint-pt-yt",
        [Cl.uint(2000000), Cl.uint(maturity2)],
        wallet1
      );

      const pt1 = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity1)],
        wallet1
      );
      expect(pt1.result).toBeOk(Cl.uint(1000000));

      const pt2 = simnet.callReadOnlyFn(
        "stakied-pt-yt-core",
        "get-pt-balance",
        [Cl.principal(wallet1), Cl.uint(maturity2)],
        wallet1
      );
      expect(pt2.result).toBeOk(Cl.uint(2000000));
    });
  });
});
