// Create transactions programmatically with Stacks.js
// Run: node create-transaction-example.js

import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  uintCV,
  principalCV,
  noneCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const network = new StacksMainnet();

// Your wallet details
const SENDER_KEY = 'your-private-key-here'; // KEEP SECRET!
const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';

// Example 1: Deposit 1 SY token
async function depositSY() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'sy-token',
    functionName: 'deposit',
    functionArgs: [uintCV(1000000)], // 1 token (6 decimals)
    senderKey: SENDER_KEY,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Transaction ID:', broadcastResponse.txid);
  console.log('View: https://explorer.hiro.so/txid/' + broadcastResponse.txid + '?chain=mainnet');
}

// Example 2: Mint PT/YT tokens
async function mintPTYT() {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'pt-yt-core',
    functionName: 'mint-pt-yt',
    functionArgs: [
      uintCV(1000000),  // 1 SY token worth
      uintCV(100000)    // maturity block height
    ],
    senderKey: SENDER_KEY,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Transaction ID:', broadcastResponse.txid);
}

// Example 3: Transfer SY tokens
async function transferSY(recipient, amount) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'sy-token',
    functionName: 'transfer',
    functionArgs: [
      uintCV(amount),
      principalCV(CONTRACT_ADDRESS), // sender
      principalCV(recipient),
      noneCV()  // memo
    ],
    senderKey: SENDER_KEY,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Transaction ID:', broadcastResponse.txid);
}

// Run examples
console.log('Creating transactions on Stacks Mainnet...');
console.log('Contract:', CONTRACT_ADDRESS);
console.log('');

// Uncomment to execute:
// depositSY();
// mintPTYT();
// transferSY('SP2XYZ...', 500000);
