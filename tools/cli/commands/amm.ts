import { Command } from 'commander';

export function createAmmCommand() {
  const amm = new Command('amm')
    .description('AMM trading operations');
  
  amm.command('swap-pt <amount> <maturity> <min-output>')
    .description('Swap PT for SY')
    .action((amount, maturity, minOutput) => {
      console.log(`Swapping ${amount} PT`);
    });
  
  return amm;
}
