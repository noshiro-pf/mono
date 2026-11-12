#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parseStartableIssuesOptions,
  STARTABLE_ISSUES_HELP,
  startableIssues,
  type StartableIssuesOptions,
} from '../commands/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';
import { attemptedPath, readTextFile, stateRoot } from '../state/index.mjs';

const options = parseStartableIssuesOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${STARTABLE_ISSUES_HELP}`);

  process.exit(1);
}

const main = async (chosen: StartableIssuesOptions): Promise<void> => {
  const transport = processFetchTransport();

  if (Result.isErr(transport)) {
    console.error(transport.value);

    process.exit(1);
  }

  const result = await startableIssues(chosen, {
    transport: transport.value,
    env: process.env,
    nowEpochMs: Date.now(),
    originUrl,
    manifestUrl,
    ghAuthToken,
    attemptedFile: (repo) => attemptedPath(stateRoot(), repo),
    readTextFile,
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
};

if (options.value === 'help') {
  console.info(STARTABLE_ISSUES_HELP);
} else {
  await main(options.value);
}
