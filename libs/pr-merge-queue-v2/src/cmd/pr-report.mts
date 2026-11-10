#!/usr/bin/env node

import * as http from 'node:http';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  HELP,
  RULESET_PATH,
  parseOptions,
  prReport,
  type Options,
} from '../commands/index.mjs';
import {
  checkoutFile,
  ghAuthToken,
  manifestUrl,
  originUrl,
  proxiedFetchTransport,
} from '../github/index.mjs';

const options = parseOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${HELP}`);

  process.exit(1);
}

const main = async (chosen: Options): Promise<void> => {
  const transport = proxiedFetchTransport(
    process.env,
    {
      setGlobalProxyFromEnv:
        typeof http.setGlobalProxyFromEnv === 'function'
          ? http.setGlobalProxyFromEnv
          : undefined,
    },
    fetch,
  );

  if (Result.isErr(transport)) {
    console.error(transport.value);

    process.exit(1);
  }

  const result = await prReport(chosen, {
    transport: transport.value,
    env: process.env,
    nowEpochMs: Date.now(),
    originUrl,
    manifestUrl,
    declaredRuleset: () => checkoutFile(RULESET_PATH),
    ghAuthToken,
    warn: (line) => {
      console.error(line);
    },
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
};

if (options.value === 'help') {
  console.info(HELP);
} else {
  await main(options.value);
}
