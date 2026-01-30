import { Simnet } from "@hirosystems/clarinet-sdk";
import { Cl } from "@stacks/transactions";

export class TestSetup {
  static readonly DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
  
  static getAccounts(simnet: Simnet) {
    return {
      deployer: simnet.getAccounts().get("deployer")!,
      wallet1: simnet.getAccounts().get("wallet_1")!,
      wallet2: simnet.getAccounts().get("wallet_2")!,
    };
  }
}
