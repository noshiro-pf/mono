#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  CLAIM_PR_HELP,
  claimPr,
  parseClaimPrOptions,
  type ClaimPrOptions,
} from '../commands/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';

const options = parseClaimPrOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${CLAIM_PR_HELP}`);

  process.exit(1);
}

const main = async (chosen: ClaimPrOptions): Promise<void> => {
  const transport = processFetchTransport();

  if (Result.isErr(transport)) {
    console.error(transport.value);

    process.exit(1);
  }

  const result = await claimPr(chosen, {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
    nowEpochMs: () => Date.now(),
    sleep: async (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      }),
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
};

if (options.value === 'help') {
  console.info(CLAIM_PR_HELP);
} else {
  await main(options.value);
}
