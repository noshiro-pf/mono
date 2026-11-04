#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parseReworkArgs,
  REWORK_PR_HELP,
  reworkPr,
} from '../rework-pr/index.mjs';

const args = parseReworkArgs(Arr.skip(process.argv, 2));

if (Result.isErr(args)) {
  console.error(`${args.value}\n\n${REWORK_PR_HELP}`);

  process.exit(1);
}

if (args.value === 'help') {
  console.info(REWORK_PR_HELP);
} else {
  const result = await reworkPr(args.value).catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
