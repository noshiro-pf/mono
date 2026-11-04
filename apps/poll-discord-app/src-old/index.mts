#!/usr/bin/env node
import { Result } from 'ts-data-forge';

import { main } from './main.mjs';

const result = await main();

if (Result.isErr(result)) {
  process.exit(1);
}
