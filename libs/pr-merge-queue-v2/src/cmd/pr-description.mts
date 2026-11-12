#!/usr/bin/env node

import * as fs from 'node:fs/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parsePrDescriptionOptions,
  PR_DESCRIPTION_HELP,
  prDescription,
  type DescriptionCommand,
} from '../commands/index.mjs';
import { readConfig } from '../config/index.mjs';
import { git } from '../git/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';
import { readTextFile } from '../state/index.mjs';

const options = parsePrDescriptionOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${PR_DESCRIPTION_HELP}`);

  process.exit(1);
}

const main = async (chosen: DescriptionCommand): Promise<void> => {
  const transport = processFetchTransport();

  if (Result.isErr(transport)) {
    console.error(transport.value);

    process.exit(1);
  }

  const root = await git(process.cwd(), ['rev-parse', '--show-toplevel']);

  const result = await prDescription(chosen, {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
    // Where git cannot say (no git, a clone it refuses), the directory it runs
    // in, as v1 does: run it from the root there, or no rule is read.
    readConfig: async () =>
      readConfig(Result.isErr(root) ? process.cwd() : root.value.trim()),
    readText: async (path) => {
      const text = await readTextFile(path);

      return Result.isOk(text) && text.value === undefined
        ? Result.err(`cannot read ${path}: there is no such file`)
        : Result.map(text, (value) => value ?? '');
    },
    writeText: async (path, text) => {
      const written = await Result.fromPromise(
        // The path is one the operator typed.
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFile(path, text, 'utf8'),
      );

      return Result.isErr(written)
        ? Result.err(`cannot write ${path}: ${unknownToString(written.value)}`)
        : Result.ok(undefined);
    },
    log: (line) => {
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
  console.info(PR_DESCRIPTION_HELP);
} else {
  await main(options.value);
}
