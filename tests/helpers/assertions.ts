import { ClarityType } from "@stacks/transactions";
import { expect } from "vitest";

export class CustomAssertions {
  static assertOk(result: any) {
    expect(result.result).toHaveProperty("type", ClarityType.ResponseOk);
  }

  static assertError(result: any, errorCode: number) {
    expect(result.result).toHaveProperty("type", ClarityType.ResponseErr);
    expect(result.result.value).toBeUint(errorCode);
  }

  static assertBalanceEquals(result: any, expectedBalance: number) {
    CustomAssertions.assertOk(result);
    expect(result.result.value).toBeUint(expectedBalance);
  }
}
