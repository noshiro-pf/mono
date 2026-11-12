#!/usr/bin/env node

import { setTimeout as sleep } from 'node:timers/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  parseReworkPrOptions,
  REWORK_PR_HELP,
  reworkPr,
  type ReworkPrOptions,
} from '../commands/index.mjs';
import {
  branchHad,
  git,
  pushLeased,
  readReworkRecord,
  removeReworkRecord,
  restack,
  writeReworkRecord,
  type GitPlace,
} from '../git/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';
import { stateRoot } from '../state/index.mjs';

const options = parseReworkPrOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${REWORK_PR_HELP}`);

  process.exit(1);
}

const main = async (chosen: ReworkPrOptions): Promise<void> => {
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

  const { cwd } = place;

  const result = await reworkPr(chosen, {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
    nowEpochMs: () => Date.now(),
    sleep: async (ms) => {
      await sleep(ms);
    },
    log: (line) => {
      console.info(line);
    },
    git: {
      branch: async () =>
        Result.map(
          await git(cwd, ['symbolic-ref', '--quiet', '--short', 'HEAD']),
          (name) => name.trim(),
        ),
      status: async () => git(cwd, ['status', '--porcelain']),
      head: async () =>
        Result.map(await git(cwd, ['rev-parse', 'HEAD']), (sha) => sha.trim()),
      branchHad: async (branch, sha) => branchHad(cwd, branch, sha),
      pushLeased: async (push) => pushLeased(cwd, push),
      restack: async (moved, layers) => restack(place, moved, layers),
      readRecord: async (number) => readReworkRecord(cwd, number),
      writeRecord: async (number, text) => writeReworkRecord(cwd, number, text),
      removeRecord: async (number) => removeReworkRecord(cwd, number),
    },
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
};

if (options.value === 'help') {
  console.info(REWORK_PR_HELP);
} else {
  await main(options.value);
}
