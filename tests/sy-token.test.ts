import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("SY Token - Transfer Function", () => {
  it("should fail to transfer with insufficient balance", () => {
    const transfer = simnet.callPublicFn(
      "sy-token",
      "transfer",
      [
        Cl.uint(1000),
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.none(),
      ],
      wallet1
    );

    expect(transfer.result).toBeErr(Cl.uint(103)); // err-insufficient-balance
  });
});

describe("SY Token - Read-Only Functions", () => {
  it("should return correct token metadata", () => {
    const name = simnet.callReadOnlyFn("sy-token", "get-name", [], deployer);
    expect(name.result).toBeOk(Cl.stringAscii("Stakied Standardized Yield"));

    const symbol = simnet.callReadOnlyFn("sy-token", "get-symbol", [], deployer);
    expect(symbol.result).toBeOk(Cl.stringAscii("SY-stSTX"));

    const decimals = simnet.callReadOnlyFn("sy-token", "get-decimals", [], deployer);
    expect(decimals.result).toBeOk(Cl.uint(6));
  });

  it("should return zero balance for new accounts", () => {
    const balance = simnet.callReadOnlyFn(
      "sy-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance.result).toBeOk(Cl.uint(0));
  });

  it("should return zero total supply initially", () => {
    const totalSupply = simnet.callReadOnlyFn("sy-token", "get-total-supply", [], deployer);
    expect(totalSupply.result).toBeOk(Cl.uint(0));
  });
});

describe("SY Token - Deposit Function", () => {
  it("should mint SY tokens correctly", () => {
    const deposit = simnet.callPublicFn(
      "sy-token",
      "deposit",
      [Cl.uint(1000000)],
      wallet1
    );

    expect(deposit.result).toBeOk(Cl.uint(1000000));

    const balance = simnet.callReadOnlyFn(
      "sy-token",
      "get-balance",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(balance.result).toBeOk(Cl.uint(1000000));

    const totalSupply = simnet.callReadOnlyFn("sy-token", "get-total-supply", [], deployer);
    expect(totalSupply.result).toBeOk(Cl.uint(1000000));
  });

  it("should fail to deposit zero amount", () => {
    const deposit = simnet.callPublicFn(
      "sy-token",
      "deposit",
      [Cl.uint(0)],
      wallet1
    );

    expect(deposit.result).toBeErr(Cl.uint(102)); // err-invalid-amount
  });

  it("should accumulate deposits correctly", () => {
    simnet.callPublicFn("sy-token", "deposit", [Cl.uint(500000)], wallet1);
    const deposit2 = simnet.callPublicFn("sy-token", "deposit", [Cl.uint(300000)], wallet1);

    expect(deposit2.result).toBeOk(Cl.uint(300000));

    const balance = simnet.callReadOnlyFn(
      "sy-token",
      "get-balance",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(balance.result).toBeOk(Cl.uint(800000));
  });
});

describe("SY Token - Redeem Function", () => {
  it("should burn SY tokens correctly", () => {
    simnet.callPublicFn("sy-token", "deposit", [Cl.uint(1000000)], wallet1);
    
    const redeem = simnet.callPublicFn(
      "sy-token",
      "redeem",
      [Cl.uint(500000)],
      wallet1
    );

    expect(redeem.result).toBeOk(Cl.uint(500000));

    const balance = simnet.callReadOnlyFn(
      "sy-token",
      "get-balance",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(balance.result).toBeOk(Cl.uint(500000));

    const totalSupply = simnet.callReadOnlyFn("sy-token", "get-total-supply", [], deployer);
    expect(totalSupply.result).toBeOk(Cl.uint(500000));
  });

  it("should fail with insufficient balance", () => {
    const redeem = simnet.callPublicFn(
      "sy-token",
      "redeem",
      [Cl.uint(1000)],
      wallet1
    );

    expect(redeem.result).toBeErr(Cl.uint(103)); // err-insufficient-balance
  });

  it("should fail to redeem zero amount", () => {
    simnet.callPublicFn("sy-token", "deposit", [Cl.uint(1000000)], wallet1);
    
    const redeem = simnet.callPublicFn(
      "sy-token",
      "redeem",
      [Cl.uint(0)],
      wallet1
    );

    expect(redeem.result).toBeErr(Cl.uint(102)); // err-invalid-amount
  });

  it("should allow complete redemption", () => {
    simnet.callPublicFn("sy-token", "deposit", [Cl.uint(750000)], wallet1);
    
    const redeem = simnet.callPublicFn(
      "sy-token",
      "redeem",
      [Cl.uint(750000)],
      wallet1
    );

    expect(redeem.result).toBeOk(Cl.uint(750000));

    const balance = simnet.callReadOnlyFn(
      "sy-token",
      "get-balance",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(balance.result).toBeOk(Cl.uint(0));
  });
});

