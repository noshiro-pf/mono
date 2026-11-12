#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parseReportUnownedPrsOptions,
  REPORT_UNOWNED_PRS_HELP,
  reportUnownedPrs,
  type ReportUnownedPrsOptions,
} from '../commands/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';

const options = parseReportUnownedPrsOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${REPORT_UNOWNED_PRS_HELP}`);

  process.exit(1);
}

const main = async (chosen: ReportUnownedPrsOptions): Promise<void> => {
  const transport = processFetchTransport();

  if (Result.isErr(transport)) {
    console.error(transport.value);

    process.exit(1);
  }

  const result = await reportUnownedPrs(chosen, {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
    nowEpochMs: () => Date.now(),
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
};

if (options.value === 'help') {
  console.info(REPORT_UNOWNED_PRS_HELP);
} else {
  await main(options.value);
}
