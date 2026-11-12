#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  OPEN_PR_HELP,
  openPr,
  parseOpenPrOptions,
  type OpenPrOptions,
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

const options = parseOpenPrOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${OPEN_PR_HELP}`);

  process.exit(1);
}

const main = async (chosen: OpenPrOptions): Promise<void> => {
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

  const cwd = root.value.trim();

  const result = await openPr(chosen, {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
    readConfig: async () => readConfig(cwd),
    readText: async (path) => {
      const text = await readTextFile(path);

      return Result.isOk(text) && text.value === undefined
        ? Result.err(`cannot read ${path}: there is no such file`)
        : Result.map(text, (value) => value ?? '');
    },
    log: (line) => {
      console.error(line);
    },
    git: {
      branch: async () => {
        const name = await git(cwd, [
          'symbolic-ref',
          '--quiet',
          '--short',
          'HEAD',
        ]);

        return Result.isErr(name)
          ? Result.err('HEAD is detached; check a branch out first')
          : Result.ok(name.value.trim());
      },
      lastSubject: async () => {
        const subject = await git(cwd, ['log', '-1', '--format=%s']);

        return Result.isErr(subject)
          ? subject
          : subject.value.trim() === ''
            ? Result.err(
                'the branch tip has no commit subject to use as a title',
              )
            : Result.ok(subject.value.trim());
      },
      push: async (branch) =>
        Result.map(
          await git(cwd, [
            'push',
            '-u',
            'origin',
            `refs/heads/${branch}:refs/heads/${branch}`,
          ]),
          () => undefined,
        ),
      containsBase: async (base) => {
        const fetched = await git(cwd, [
          'fetch',
          '--quiet',
          'origin',
          `+refs/heads/${base}:refs/remotes/origin/${base}`,
        ]);

        if (Result.isErr(fetched)) {
          return Result.err(`cannot fetch ${base}: ${fetched.value}`);
        }

        // Exits 1 when it is not.
        const contained = await git(cwd, [
          'merge-base',
          '--is-ancestor',
          `refs/remotes/origin/${base}`,
          'HEAD',
        ]);

        return Result.isErr(contained)
          ? Result.err(
              `the branch does not contain the tip of ${base}; rebase it onto origin/${base} first, or its diff will carry that layer's old commits`,
            )
          : Result.ok(undefined);
      },
    },
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
};

if (options.value === 'help') {
  console.info(OPEN_PR_HELP);
} else {
  await main(options.value);
}
