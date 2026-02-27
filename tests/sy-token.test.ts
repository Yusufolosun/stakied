import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("SY Token Tests", () => {
  describe("Read-Only Functions", () => {
    it("returns correct token metadata", () => {
      const name = simnet.callReadOnlyFn("stakied-sy-token", "get-name", [], deployer);
      expect(name.result).toBeOk(Cl.stringAscii("Stakied Standardized Yield"));

      const symbol = simnet.callReadOnlyFn("stakied-sy-token", "get-symbol", [], deployer);
      expect(symbol.result).toBeOk(Cl.stringAscii("SY-stSTX"));

      const decimals = simnet.callReadOnlyFn("stakied-sy-token", "get-decimals", [], deployer);
      expect(decimals.result).toBeOk(Cl.uint(6));
    });

    it("returns zero balance for new accounts", () => {
      const balance = simnet.callReadOnlyFn(
        "stakied-sy-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance.result).toBeOk(Cl.uint(0));
    });

    it("returns 1:1 initial exchange rate", () => {
      const rate = simnet.callReadOnlyFn("stakied-sy-token", "get-exchange-rate", [], deployer);
      expect(rate.result).toBeOk(Cl.uint(1000000));
    });

    it("returns zero total supply initially", () => {
      const supply = simnet.callReadOnlyFn("stakied-sy-token", "get-total-supply", [], deployer);
      expect(supply.result).toBeOk(Cl.uint(0));
    });
  });

  describe("Deposit Function", () => {
    it("mints SY tokens correctly", () => {
      const deposit = simnet.callPublicFn(
        "stakied-sy-token",
        "deposit",
        [Cl.uint(1000000)],
        wallet1
      );

      expect(deposit.result).toBeOk(Cl.uint(1000000));

      const balance = simnet.callReadOnlyFn(
        "stakied-sy-token",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(balance.result).toBeOk(Cl.uint(1000000));
    });

    it("fails to deposit zero amount", () => {
      const deposit = simnet.callPublicFn(
        "stakied-sy-token",
        "deposit",
        [Cl.uint(0)],
        wallet1
      );

      expect(deposit.result).toBeErr(Cl.uint(102));
    });

    it("accumulates balance on multiple deposits", () => {
      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(500000)], wallet1);
      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(300000)], wallet1);

      const balance = simnet.callReadOnlyFn(
        "stakied-sy-token",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(balance.result).toBeOk(Cl.uint(800000));
    });
  });

  describe("Redeem Function", () => {
    it("burns SY tokens correctly", () => {
      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(1000000)], wallet1);
      
      const redeem = simnet.callPublicFn(
        "stakied-sy-token",
        "redeem",
        [Cl.uint(500000)],
        wallet1
      );

      expect(redeem.result).toBeOk(Cl.uint(500000));

      const balance = simnet.callReadOnlyFn(
        "stakied-sy-token",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(balance.result).toBeOk(Cl.uint(500000));
    });

    it("fails with insufficient balance", () => {
      const redeem = simnet.callPublicFn(
        "stakied-sy-token",
        "redeem",
        [Cl.uint(1000)],
        wallet2
      );

      expect(redeem.result).toBeErr(Cl.uint(103));
    });

    it("fails to redeem zero amount", () => {
      const redeem = simnet.callPublicFn(
        "stakied-sy-token",
        "redeem",
        [Cl.uint(0)],
        wallet1
      );

      expect(redeem.result).toBeErr(Cl.uint(102));
    });
  });

  describe("Exchange Rate Updates", () => {
    it("allows owner to update exchange rate", () => {
      const update = simnet.callPublicFn(
        "stakied-sy-token",
        "update-exchange-rate",
        [Cl.uint(1050000)],
        deployer
      );

      expect(update.result).toBeOk(Cl.bool(true));

      const rate = simnet.callReadOnlyFn("stakied-sy-token", "get-exchange-rate", [], deployer);
      expect(rate.result).toBeOk(Cl.uint(1050000));
    });

    it("prevents non-owner from updating", () => {
      const update = simnet.callPublicFn(
        "stakied-sy-token",
        "update-exchange-rate",
        [Cl.uint(1100000)],
        wallet1
      );

      expect(update.result).toBeErr(Cl.uint(100));
    });

    it("rejects zero exchange rate", () => {
      const update = simnet.callPublicFn(
        "stakied-sy-token",
        "update-exchange-rate",
        [Cl.uint(0)],
        deployer
      );

      expect(update.result).toBeErr(Cl.uint(102));
    });
  });

  describe("Transfer Function", () => {
    it("transfers tokens successfully", () => {
      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(1000000)], wallet1);

      const transfer = simnet.callPublicFn(
        "stakied-sy-token",
        "transfer",
        [
          Cl.uint(300000),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );

      expect(transfer.result).toBeOk(Cl.bool(true));

      const balance1 = simnet.callReadOnlyFn(
        "stakied-sy-token",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(balance1.result).toBeOk(Cl.uint(700000));

      const balance2 = simnet.callReadOnlyFn(
        "stakied-sy-token",
        "get-balance",
        [Cl.principal(wallet2)],
        wallet2
      );
      expect(balance2.result).toBeOk(Cl.uint(300000));
    });

    it("fails to transfer with insufficient balance", () => {
      const transfer = simnet.callPublicFn(
        "stakied-sy-token",
        "transfer",
        [
          Cl.uint(1000),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );

      expect(transfer.result).toBeErr(Cl.uint(103));
    });

    it("rejects zero amount transfer", () => {
      const transfer = simnet.callPublicFn(
        "stakied-sy-token",
        "transfer",
        [
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );

      expect(transfer.result).toBeErr(Cl.uint(102));
    });

    it("prevents unauthorized transfers", () => {
      simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(1000000)], wallet1);

      const transfer = simnet.callPublicFn(
        "stakied-sy-token",
        "transfer",
        [
          Cl.uint(100),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet2
      );

      expect(transfer.result).toBeErr(Cl.uint(101));
    });
  });
});
