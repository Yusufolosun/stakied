import { StakiedSDK } from '@stakied/sdk';
import { StacksMainnet } from '@stacks/network';

// Basic usage example
async function main() {
  const sdk = new StakiedSDK({
    network: new StacksMainnet(),
    contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
  });
  
  console.log('Stakied SDK initialized');
}

main();
