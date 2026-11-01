#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  HELP,
  parseOptions,
  runDescription,
} from '../pr-description/index.mjs';

const options = parseOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${HELP}`);

  process.exit(1);
}

if (options.value === 'help') {
  console.info(HELP);
} else {
  const result = await runDescription(options.value).catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  // `read` prints a description, which ends in a newline of its own.
  process.stdout.write(
    result.value.endsWith('\n') ? result.value : `${result.value}\n`,
  );
}
