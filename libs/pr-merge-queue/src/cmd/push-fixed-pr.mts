#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  PUSH_FIXED_PR_HELP,
  parsePushArgs,
  pushFixedPr,
} from '../push-fixed-pr/index.mjs';

const argv = Arr.skip(process.argv, 2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.info(PUSH_FIXED_PR_HELP);

  process.exit(0);
}

const args = parsePushArgs(argv);

if (typeof args === 'string') {
  console.error(`${args}\n\n${PUSH_FIXED_PR_HELP}`);

  process.exit(1);
}

const result = await pushFixedPr(args).catch((error: unknown) =>
  Result.err(unknownToString(error)),
);

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}

console.info(result.value);
