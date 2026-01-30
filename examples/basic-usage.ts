import { StakiedSDK } from '@stakied/sdk';
import { StacksMainnet } from '@stacks/network';

// Basic usage example
async function main() {
  const sdk = new StakiedSDK({
    network: new StacksMainnet(),
    contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
  });
  
  console.log('Stakied SDK initialized');
  
  // Query SY balance
  const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
  const balance = await sdk.sy.getBalance(address);
  console.log(`SY Balance: ${balance}`);
}

main();
