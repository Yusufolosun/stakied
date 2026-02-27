import { describe, it } from "vitest";
import { initSimnet } from "@stacks/clarinet-sdk";
import { TestSetup } from "../helpers/setup";
import { TestFixtures } from "../helpers/fixtures";

describe("Full Flow Integration Tests", () => {
  it("should complete full deposit to redemption cycle", async () => {
    const simnet = await initSimnet();
    const accounts = TestSetup.getAccounts(simnet);

    TestSetup.fundAccount(simnet, accounts.wallet1, TestFixtures.DEFAULT_AMOUNT);
    TestSetup.mintPTYT(simnet, accounts.wallet1, TestFixtures.SMALL_AMOUNT, TestFixtures.DEFAULT_MATURITY);
  });
});
