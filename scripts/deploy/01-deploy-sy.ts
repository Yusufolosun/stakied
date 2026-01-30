import { StacksMainnet } from "@stacks/network";
import { makeContractDeploy, broadcastTransaction } from "@stacks/transactions";

const network = new StacksMainnet();

async function deploySYToken() {
  console.log("Starting SY Token deployment to mainnet...");
}

deploySYToken().catch(console.error);
