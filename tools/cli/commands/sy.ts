import { Command } from 'commander';

export function createSyCommand() {
  const sy = new Command('sy')
    .description('SY token operations');
  
  sy.command('deposit <amount>')
    .description('Deposit assets to receive SY tokens')
    .action((amount) => {
      console.log(`Depositing ${amount}`);
    });
  
  return sy;
}
