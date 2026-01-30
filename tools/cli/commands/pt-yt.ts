import { Command } from 'commander';

export function createPtYtCommand() {
  const ptYt = new Command('pt-yt')
    .description('PT/YT token operations');
  
  ptYt.command('mint <sy-amount> <maturity>')
    .description('Mint PT and YT tokens from SY')
    .action((syAmount, maturity) => {
      console.log(`Minting PT/YT from ${syAmount} SY`);
    });
  
  return ptYt;
}
