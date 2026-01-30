import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.stakied');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface Config {
  network: 'mainnet' | 'testnet' | 'devnet';
  privateKey?: string;
  seedPhrase?: string;
}

export function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { network: 'mainnet' };
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

export function saveConfig(config: Config): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
