#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import { HELP, openPullRequest, parseOptions } from '../open-pr/index.mjs';

const options = parseOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${HELP}`);

  process.exit(1);
}

if (options.value === 'help') {
  console.info(HELP);
} else {
  const result = await openPullRequest(options.value).catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
