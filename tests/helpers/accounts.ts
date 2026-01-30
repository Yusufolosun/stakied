import { Simnet } from "@hirosystems/clarinet-sdk";

export class AccountHelper {
  static getDeployer(simnet: Simnet) {
    return simnet.getAccounts().get("deployer")!;
  }
  
  static getUser(simnet: Simnet, index: number) {
    return simnet.getAccounts().get(`wallet_${index}`)!;
  }
  
  static getAllUsers(simnet: Simnet) {
    const accounts = simnet.getAccounts();
    return [
      accounts.get("wallet_1")!,
      accounts.get("wallet_2")!,
      accounts.get("wallet_3")!,
    ];
  }
}
