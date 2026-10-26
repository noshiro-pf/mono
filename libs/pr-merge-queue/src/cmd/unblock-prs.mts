#!/usr/bin/env node

import { Arr, Result } from 'ts-data-forge';
import { HELP, parseOptions, unblockPrs } from '../unblock-prs/index.mjs';

const options = parseOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${HELP}`);

  process.exit(2);
}

if (options.value === 'help') {
  console.info(HELP);
} else {
  const result = await unblockPrs(options.value);

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
