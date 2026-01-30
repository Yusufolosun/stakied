import { Simnet } from "@hirosystems/clarinet-sdk";

export class AccountHelper {
  static getDeployer(simnet: Simnet) {
    return simnet.getAccounts().get("deployer")!;
  }
}
