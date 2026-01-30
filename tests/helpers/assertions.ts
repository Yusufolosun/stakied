import { Cl, ClarityType } from "@stacks/transactions";
import { expect } from "vitest";

export class CustomAssertions {
  static assertOk(result: any) {
    expect(result.result).toHaveProperty("type", ClarityType.ResponseOk);
  }
}
