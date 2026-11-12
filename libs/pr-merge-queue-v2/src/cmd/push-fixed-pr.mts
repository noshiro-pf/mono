#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parsePushFixedPrOptions,
  PUSH_FIXED_PR_HELP,
  pushFixedPr,
  type PushFixedPrOptions,
} from '../commands/index.mjs';
import { readConfig } from '../config/index.mjs';
import { git, pushLeased, restack, type GitPlace } from '../git/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';
import { stateRoot } from '../state/index.mjs';

const options = parsePushFixedPrOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${PUSH_FIXED_PR_HELP}`);

  process.exit(1);
}

const main = async (chosen: PushFixedPrOptions): Promise<void> => {
  const transport = processFetchTransport();

  if (Result.isErr(transport)) {
    console.error(transport.value);

    process.exit(1);
  }

  const root = await git(process.cwd(), ['rev-parse', '--show-toplevel']);

  if (Result.isErr(root)) {
    console.error(`run it in a clone of the repository: ${root.value}`);

    process.exit(1);
  }

  const place: GitPlace = {
    cwd: root.value.trim(),
    worktreeRoot: stateRoot(),
  } as const;

  const result = await pushFixedPr(chosen, {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
    nowEpochMs: () => Date.now(),
    readConfig: async () => readConfig(place.cwd),
    git: {
      resolveCommit: async (revision) =>
        Result.unwrapOkOr(
          Result.map(
            await git(place.cwd, [
              'rev-parse',
              '--verify',
              '--quiet',
              `${revision}^0`,
            ]),
            (sha) => sha.trim(),
          ),
          undefined,
        ),
      pushLeased: async (push) => pushLeased(place.cwd, push),
      restack: async (moved, layers) => restack(place, moved, layers),
    },
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
};

if (options.value === 'help') {
  console.info(PUSH_FIXED_PR_HELP);
} else {
  await main(options.value);
}
