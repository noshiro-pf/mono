#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { readIssueUpdatedAt, readStartIssue } from 'pr-report-core-v2';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { removeDir, runClaude } from '../agent/index.mjs';
import { logLine, machineOffsetMinutes } from '../cli/index.mjs';
import {
  parseRunIssueResolverOptions,
  readIssueDecisions,
  RUN_ISSUE_RESOLVER_HELP,
  runIssueResolver,
  startIssue,
  type RunIssueResolverOptions,
} from '../commands/index.mjs';
import { git } from '../git/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  messageOf,
  openSession,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';
import {
  attemptedPath,
  parseAttempted,
  readTextFile,
  replaceFile,
  serializeAttempted,
  stateRoot,
} from '../state/index.mjs';

const options = parseRunIssueResolverOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${RUN_ISSUE_RESOLVER_HELP}`);

  process.exit(1);
}

const log = (line: string): void => {
  const now = Date.now();

  console.info(logLine(line, now, machineOffsetMinutes(now)));
};

/**
 * The first SIGINT / SIGTERM lets the sessions running finish and wakes any
 * pause; a second exits at once. Each session gets the signal itself
 * (`runClaude`).
 */
const stop = new AbortController();

const onSignal = (signal: NodeJS.Signals): void => {
  log(`${signal}: finishing the sessions running, then stopping.`);

  stop.abort();

  process.once(signal, () => {
    process.exit(130);
  });
};

const fail = (message: string): void => {
  console.error(message);

  process.exit(1);
};

const main = async (chosen: RunIssueResolverOptions): Promise<void> => {
  const transport = processFetchTransport();

  if (Result.isErr(transport)) {
    fail(transport.value);

    return;
  }

  const root = await git(process.cwd(), ['rev-parse', '--show-toplevel']);

  if (Result.isErr(root)) {
    fail(`run it in a clone of the repository: ${root.value}`);

    return;
  }

  const cwd = root.value.trim();

  const sessionWorld = {
    transport: transport.value,
    env: process.env,
    originUrl,
    manifestUrl,
    ghAuthToken,
  } as const;

  // Once: the repository and the token's account do not change while it runs.
  const session = await openSession(undefined, sessionWorld);

  if (Result.isErr(session)) {
    fail(session.value);

    return;
  }

  const { context, repo, viewer } = session.value;

  const repoName = `${repo.owner}/${repo.name}` as const;

  const claimWorld = {
    ...sessionWorld,
    nowEpochMs: () => Date.now(),
    sleep: async (ms: number) => sleep(ms),
  } as const;

  const sessionsRoot = stateRoot();

  const recordFile = attemptedPath(sessionsRoot, repo);

  process.once('SIGINT', onSignal);

  process.once('SIGTERM', onSignal);

  const result = await runIssueResolver(chosen, {
    env: process.env,
    root: cwd,
    viewer,
    log,
    stopRequested: () => stop.signal.aborted,
    nowEpochMs: () => Date.now(),
    pause: async (ms, signal) => {
      await sleep(ms, undefined, {
        signal: AbortSignal.any([signal, stop.signal]),
      }).catch(() => undefined);
    },
    readIssues: async () =>
      Result.map(
        await readIssueDecisions(context, Date.now()),
        ({ issues }) => issues,
      ),
    readRecord: async () => {
      const text = await readTextFile(recordFile);

      return Result.isErr(text) ? text : parseAttempted(text.value, recordFile);
    },
    writeRecord: async (record) =>
      replaceFile(recordFile, serializeAttempted(record)),
    startIssue: async (number, by, mode) =>
      startIssue(
        { number, by, mode, force: false, repo: repoName },
        claimWorld,
      ),
    readIssueAfter: async (number) => {
      const read = await readStartIssue(context, number, {
        viewer,
        nowEpochMs: Date.now(),
        withClosers: true,
      });

      return Result.isErr(read)
        ? Result.err(messageOf(read.value))
        : Result.ok({
            open: read.value.facts.open,
            closedBy: read.value.facts.closers,
          });
    },
    readUpdatedAt: async (number) =>
      Result.mapErr(await readIssueUpdatedAt(context, number), messageOf),
    newClaimant: () => `run-issue-resolver-${randomUUID().slice(0, 8)}`,
    makeSessionDir: async () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the state root
      await fs.mkdir(sessionsRoot, { recursive: true });

      return fs.mkdtemp(path.join(sessionsRoot, 'run-issue-resolver-'));
    },
    sessionDirPattern: path.join(sessionsRoot, 'run-issue-resolver-XXXXXX'),
    addWorktree: async (worktree, number) => {
      // Bounded: a fetch stalled on the network would hold every session behind
      // it in the queue.
      const fetched = await git(cwd, [
        '-c',
        'http.lowSpeedLimit=1000',
        '-c',
        'http.lowSpeedTime=60',
        'fetch',
        'origin',
        'main',
      ]);

      if (Result.isErr(fetched)) {
        log(
          `#${number}: git fetch: ${fetched.value}; starting from origin/main as it stands.`,
        );
      }

      return git(cwd, ['worktree', 'add', '--detach', worktree, 'origin/main']);
    },
    pruneWorktrees: async () => git(cwd, ['worktree', 'prune']),
    removeDir: async (dir) => removeDir(dir, log),
    runClaude,
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    fail(result.value);
  }
};

if (options.value === 'help') {
  console.info(RUN_ISSUE_RESOLVER_HELP);
} else {
  await main(options.value);
}
