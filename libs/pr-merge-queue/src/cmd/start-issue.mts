#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parseStartIssueArgs,
  START_ISSUE_HELP,
  startIssue,
} from '../start-issue/index.mjs';

const argv = Arr.skip(process.argv, 2);

if (argv.includes('--help') || argv.includes('-h')) {
  console.info(START_ISSUE_HELP);

  process.exit(0);
}

const args = parseStartIssueArgs(argv);

if (typeof args === 'string') {
  console.error(`${args}\n\n${START_ISSUE_HELP}`);

  process.exit(1);
}

const result = await startIssue(args).catch((error: unknown) =>
  Result.err(unknownToString(error)),
);

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}

console.info(result.value);
