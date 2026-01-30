#!/usr/bin/env node

import { program } from 'commander';

program
  .name('stakied')
  .description('Stakied Protocol CLI')
  .version('1.0.0');

program.parse();
