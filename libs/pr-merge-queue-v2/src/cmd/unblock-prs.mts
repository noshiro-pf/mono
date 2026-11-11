#!/usr/bin/env node

import { setTimeout as sleep } from 'node:timers/promises';
import { readSnapshotGraphql, type Read } from 'pr-report-core-v2';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { logLine, machineOffsetMinutes } from '../cli/index.mjs';
import {
  parseUnblockPrsOptions,
  UNBLOCK_PRS_HELP,
  unblockPrs,
  type UnblockPrsOptions,
} from '../commands/index.mjs';
import { readConfig } from '../config/index.mjs';
import {
  autoFixInWorktree,
  buildLayers,
  conflictsWithTip,
  deleteLayerBranch,
  git,
  planAutoFix,
  rebaseOnTipAndPush,
  restack,
  type GitPlace,
} from '../git/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';
import {
  readTextFile,
  replaceFile,
  stateRoot,
  workerMemoryPath,
} from '../state/index.mjs';

const options = parseUnblockPrsOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${UNBLOCK_PRS_HELP}`);

  process.exit(1);
}

const log = (line: string): void => {
  const now = Date.now();

  console.info(logLine(line, now, machineOffsetMinutes(now)));
};

/**
 * The first SIGINT / SIGTERM lets the current step finish and wakes any sleep;
 * a second exits at once.
 */
const stop = new AbortController();

const onSignal = (signal: NodeJS.Signals): void => {
  log(`${signal}: finishing the current step, then stopping.`);

  stop.abort();

  process.once(signal, () => {
    process.exit(130);
  });
};

/** `git ls-remote --heads origin`, as the snapshot's branch tips. */
const branchTips = async (
  cwd: string,
): Promise<Read<ReadonlyMap<string, string>>> => {
  const listed = await git(cwd, ['ls-remote', '--heads', 'origin']);

  if (Result.isErr(listed)) {
    return Result.err({
      kind: 'unavailable',
      what: 'the branch tips',
      message: listed.value,
    });
  }

  return Result.ok(
    new Map<string, string>(
      Arr.generate(function* () {
        for (const line of listed.value.split('\n')) {
          const [sha, ref] = line.split('\t', 2);

          if (sha !== undefined && ref?.startsWith(HEADS) === true) {
            yield [ref.slice(HEADS.length), sha] as const;
          }
        }
      }),
    ),
  );
};

const HEADS = 'refs/heads/';

const main = async (chosen: UnblockPrsOptions): Promise<void> => {
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

  process.once('SIGINT', onSignal);

  process.once('SIGTERM', onSignal);

  const result = await unblockPrs(chosen, {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
    nowEpochMs: () => Date.now(),
    sleep: async (ms) => {
      await sleep(ms, undefined, { signal: stop.signal }).catch(
        () => undefined,
      );
    },
    log,
    stopRequested: () => stop.signal.aborted,
    readConfig: async () => readConfig(cwd),
    readSnapshot: readSnapshotGraphql,
    memory: {
      read: async (repo) => readTextFile(workerMemoryPath(stateRoot(), repo)),
      write: async (repo, text) =>
        replaceFile(workerMemoryPath(stateRoot(), repo), text),
    },
    git: {
      branchTips: async () => branchTips(cwd),
      conflictsWithTip: async (head, tip) => conflictsWithTip(cwd, head, tip),
      rebaseOnTip: async (pr) =>
        rebaseOnTipAndPush(
          place,
          pr,
          pr.regenerate === undefined
            ? undefined
            : {
                config: pr.regenerate,
                log,
                stopRequested: () => stop.signal.aborted,
              },
        ),
      restack: async (moved, layers) => restack(place, moved, layers),
      buildLayers: async (base, defaultBranch, layers) =>
        buildLayers(place, { base, defaultBranch, layers }, log),
      deleteBranch: async (branch) => deleteLayerBranch(cwd, branch),
    },
    autoFix: (config) => async (pr) => {
      if (Result.isErr(pr.checks)) {
        return Result.ok({
          kind: 'declined',
          why: `its checks could not be read: ${pr.checks.value.message}`,
        });
      }

      const plan = planAutoFix(pr.checks.value, config?.autoFix, Date.now());

      return Result.isErr(plan)
        ? Result.ok({ kind: 'declined', why: plan.value })
        : autoFixInWorktree(
            place,
            {
              number: pr.number,
              branch: pr.headRef,
              head: pr.headSha,
              base: pr.baseRef,
            },
            plan.value,
            { log, stopRequested: () => stop.signal.aborted },
          );
    },
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  log(result.value);
};

if (options.value === 'help') {
  console.info(UNBLOCK_PRS_HELP);
} else {
  await main(options.value);
}
