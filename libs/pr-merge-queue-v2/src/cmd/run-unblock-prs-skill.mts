#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { removeDir, runClaude } from '../agent/index.mjs';
import { logLine, machineOffsetMinutes } from '../cli/index.mjs';
import {
  claimPr,
  parseRunUnblockPrsSkillOptions,
  readQueue,
  reportUnowned,
  RUN_UNBLOCK_PRS_SKILL_HELP,
  runUnblockPrsSkill,
  type RunUnblockPrsSkillOptions,
} from '../commands/index.mjs';
import { git } from '../git/index.mjs';
import {
  ghAuthToken,
  manifestUrl,
  openSession,
  originUrl,
  processFetchTransport,
} from '../github/index.mjs';
import { stateRoot } from '../state/index.mjs';

const options = parseRunUnblockPrsSkillOptions(Arr.skip(process.argv, 2));

if (Result.isErr(options)) {
  console.error(`${options.value}\n\n${RUN_UNBLOCK_PRS_SKILL_HELP}`);

  process.exit(1);
}

const log = (line: string): void => {
  const now = Date.now();

  console.info(logLine(line, now, machineOffsetMinutes(now)));
};

/**
 * The first SIGINT / SIGTERM lets the current round finish and wakes any sleep;
 * a second exits at once. The session gets the signal itself (`runClaude`).
 */
const stop = new AbortController();

const onSignal = (signal: NodeJS.Signals): void => {
  log(`${signal}: finishing the current round, then stopping.`);

  stop.abort();

  process.once(signal, () => {
    process.exit(130);
  });
};

const fail = (message: string): never => {
  console.error(message);

  process.exit(1);
};

const main = async (chosen: RunUnblockPrsSkillOptions): Promise<void> => {
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

  // Once: the repository and the token's account do not change while it runs,
  // and without them no owner can be read and every round would say so.
  const session = await openSession(undefined, sessionWorld);

  if (Result.isErr(session)) {
    fail(session.value);

    return;
  }

  const { context, repo } = session.value;

  const sessionsRoot = stateRoot();

  process.once('SIGINT', onSignal);

  process.once('SIGTERM', onSignal);

  const result = await runUnblockPrsSkill(chosen, {
    env: process.env,
    root: cwd,
    log,
    stopRequested: () => stop.signal.aborted,
    sleep: async (ms) => {
      await sleep(ms, undefined, { signal: stop.signal }).catch(
        () => undefined,
      );
    },
    skillLinked: async () =>
      Result.isOk(
        await Result.fromPromise(
          fs.access(path.join(cwd, '.claude/skills/unblock-prs/SKILL.md')),
        ),
      ),
    readQueue: async () =>
      Result.map(
        await readQueue(context, Date.now()),
        ({ pullRequests }) => pullRequests,
      ),
    reportUnowned: async (pullRequests, dryRun) =>
      reportUnowned(session.value, pullRequests, dryRun),
    releaseClaim: async (number, claimant) =>
      claimPr(
        {
          number,
          by: claimant,
          release: true,
          repo: `${repo.owner}/${repo.name}`,
        },
        {
          ...sessionWorld,
          nowEpochMs: () => Date.now(),
          sleep: async (ms) => sleep(ms),
        },
      ).catch((error: unknown) => Result.err(unknownToString(error))),
    newClaimant: () => `run-unblock-prs-skill-${randomUUID().slice(0, 8)}`,
    makeSessionDir: async () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the state root
      await fs.mkdir(sessionsRoot, { recursive: true });

      return fs.mkdtemp(path.join(sessionsRoot, 'run-unblock-prs-skill-'));
    },
    sessionDirPattern: path.join(sessionsRoot, 'run-unblock-prs-skill-XXXXXX'),
    removeDir: async (dir) => removeDir(dir, log),
    runClaude: async (at, args, env, check) =>
      runClaude(at, args, env, check, log),
    pruneWorktrees: async () => git(cwd, ['worktree', 'prune']),
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    fail(result.value);
  }
};

if (options.value === 'help') {
  console.info(RUN_UNBLOCK_PRS_SKILL_HELP);
} else {
  await main(options.value);
}
