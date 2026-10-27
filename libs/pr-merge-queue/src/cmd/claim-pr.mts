#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import { CLAIM_PR_HELP, claimPr, parseClaimArgs } from '../claim-pr/index.mjs';

const argv = Arr.skip(process.argv, 2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.info(CLAIM_PR_HELP);

  process.exit(0);
}

const args = parseClaimArgs(argv);

if (typeof args === 'string') {
  console.error(`${args}\n\n${CLAIM_PR_HELP}`);

  process.exit(1);
}

const result = await claimPr(args).catch((error: unknown) =>
  Result.err(unknownToString(error)),
);

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}

console.info(result.value);
