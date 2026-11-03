#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parseStartableIssuesArgs,
  STARTABLE_ISSUES_HELP,
  startableIssues,
} from '../startable-issues/index.mjs';

const args = parseStartableIssuesArgs(Arr.skip(process.argv, 2));

if (Result.isErr(args)) {
  console.error(`${args.value}\n\n${STARTABLE_ISSUES_HELP}`);

  process.exit(1);
}

if (args.value === 'help') {
  console.info(STARTABLE_ISSUES_HELP);

  process.exit(0);
}

const result = await startableIssues(args.value).catch((error: unknown) =>
  Result.err(unknownToString(error)),
);

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}

console.info(result.value);
