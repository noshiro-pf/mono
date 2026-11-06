// cspell:ignore gpgsign

/**
 * Checking queued pull requests ahead of their turn: reading the layer branches
 * and the runs on them, building and dispatching layers, and dropping the ones
 * a red layer below has spoiled. What is decided is `speculate-plan.mts`'s;
 * this is the reading and the moving.
 *
 * Every survey starts from what GitHub holds, so a worker restarted mid-stack
 * picks up where the branches are. A step that fails is logged and leaves the
 * first candidate to be released as it would be without any of this: the worst
 * that does is a matrix run twice.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { statesFromCheckRuns } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  currentEpochMs,
  git,
  log,
  rest,
  sh,
  type ApiContext,
} from '../lib/index.mjs';
import { planAutoFix, WORKTREE_ROOT } from './auto-fix.mjs';
import type { AutoFixConfig, SpeculateConfig } from './config.mjs';
import { listCheckRuns, removeWorktree } from './github.mjs';
import {
  buildableLayers,
  cancelledTooOften,
  decideSpeculation,
  desiredLayers,
  dropActionOf,
  isStuck,
  LAYER_BRANCH_PREFIX,
  layerBranch,
  layerMessage,
  layerOfMessage,
  matchLayers,
  MAX_DISPATCHES,
  mayBuildAbove,
  numberOfLayerBranch,
  type BuiltLayer,
  type Layer,
  type LayerStatus,
} from './speculate-plan.mjs';
import type { PullRequest, SkipRecord } from './types.mjs';

/**
 * One survey's turn of the stack: build what is missing, dispatch the next
 * layer when the ones below have started, drop what a red layer spoiled, and
 * say whether the first candidate may go.
 */
export const speculate = async (
  api: ApiContext,
  context: Readonly<{
    candidates: readonly PullRequest[];
    defaultBranch: string;
    baseSha: string;
    bypass: ReadonlyMap<number, string>;
    config: SpeculateConfig;
    /** `undefined` under `--no-auto-fix`, or when the repository has none. */
    autoFix: AutoFixConfig | undefined;
    /** Those set aside for a failure, whose layer's red run is kept. */
    failing: ReadonlySet<number>;
  }>,
): Promise<Speculation> => {
  const { candidates, defaultBranch, baseSha, config } = context;

  const desired = desiredLayers(candidates, {
    defaultBranch,
    bypass: context.bypass,
    depth: config.depth,
  });

  const branches = await readBuiltLayers(baseSha);

  if (Result.isErr(branches)) {
    return fallBack(`cannot read the layer branches: ${branches.value}`);
  }

  const { kept, toBuild, stale } = matchLayers({
    desired,
    built: branches.value.built,
    baseTree: branches.value.baseTree,
  });

  const held = await dropLayers(
    api,
    stale,
    branches.value.baseTree,
    context.failing,
  );

  const keptStatuses = await readStatusesOf(api, kept, config.workflows);

  if (Result.isErr(keptStatuses)) {
    return fallBack(keptStatuses.value);
  }

  const buildable = mayBuildAbove(
    keptStatuses.value.map(({ status }) => status),
  )
    ? buildableLayers(toBuild, held)
    : ([] as const);

  const builtNow = Arr.isNonEmpty(buildable)
    ? await buildLayers(buildable, kept.at(-1)?.tip ?? baseSha, defaultBranch)
    : ([] as const);

  const builtStatuses = await readStatusesOf(api, builtNow, config.workflows);

  if (Result.isErr(builtStatuses)) {
    return fallBack(builtStatuses.value);
  }

  const layers = [...kept, ...builtNow] as const;

  const read = [...keptStatuses.value, ...builtStatuses.value] as const;

  const decided = decideSpeculation({
    layers,
    statuses: read.map(({ status }) => status),
    firstCandidate: candidates[0]?.number,
  });

  if (decided.dropFrom !== undefined) {
    for (const [index, layer] of layers.entries()) {
      if (index < decided.dropFrom) {
        continue;
      }

      log(
        `#${layer.number}: dropping its layer, which carries a red one below it.`,
      );

      if (await dropRuns(api, read[index]?.runs ?? [], false)) {
        await deleteBranch(layer.number);
      }
    }
  }

  // A failure the configured fixers can settle is left to the release, as it
  // always has been: `watchAndFix` reads the jobs on the pull request's own
  // head, so the layer's runs go, or the gate reuses their verdict and leaves no
  // job there to read. Should they not all go, or the jobs not be read, the
  // release is still the way on: at worst it is set aside there, for what its own
  // checks say, where waiting here for GitHub to agree could hold the queue.
  if (decided.setAside !== undefined && layers[0] !== undefined) {
    const fixersOwn = await isFixersOwn(api, layers[0].tip, context.autoFix);

    if (Result.isErr(fixersOwn)) {
      return fallBack(`cannot read its layer's jobs: ${fixersOwn.value}`);
    }

    if (fixersOwn.value) {
      log(
        `#${decided.setAside.number}: only fixers' diffs failed on its layer; releasing it, for the release's own run to fix.`,
      );

      if (await dropRuns(api, read[0]?.runs ?? [], false)) {
        await deleteBranch(decided.setAside.number);
      }

      return { stacked: false, release: true, setAside: undefined };
    }
  }

  const firstStatus = read[0];

  // Before dispatching more: a survey that gives up on the stack should not
  // have just started runs on it.
  if (
    firstStatus !== undefined &&
    !decided.release &&
    isStuck(firstStatus.status, firstStatus.runningSince, currentEpochMs())
  ) {
    return fallBack(
      `${layerBranch(layers[0]?.number ?? 0)} has been running for too long`,
    );
  }

  if (decided.dispatch !== undefined) {
    const layer = layers[decided.dispatch];

    const missing = read[decided.dispatch]?.missing ?? [];

    if (read[decided.dispatch]?.cancelledTooOften === true) {
      const why =
        `${layerBranch(layer?.number ?? 0)} has had a workflow cancelled ${MAX_DISPATCHES} times` as const;

      if (decided.dispatch === 0) {
        return fallBack(why);
      }

      log(`Not dispatching: ${why}; it is decided once that layer is first.`);
    } else if (layer !== undefined) {
      log(
        `#${layer.number}: dispatching ${missing.join(', ')} on ${layerBranch(layer.number)}.`,
      );

      for (const workflow of missing) {
        const dispatched = await dispatch(api, workflow, layer.number);

        if (Result.isErr(dispatched)) {
          // The first layer would be waited for for ever; one above it is tried
          // again on the next survey.
          if (decided.dispatch === 0) {
            return fallBack(`cannot dispatch ${workflow}: ${dispatched.value}`);
          }

          log(
            `#${layer.number}: cannot dispatch ${workflow}; trying again on the next survey: ${dispatched.value}`,
          );

          break;
        }
      }
    }
  }

  if (!decided.release && candidates[0] !== undefined) {
    log(
      `#${candidates[0].number}: waiting for its layer's checks before releasing it.`,
    );
  }

  return {
    stacked: Arr.isNonEmpty(layers),
    release: decided.release,
    setAside:
      decided.setAside === undefined
        ? undefined
        : {
            number: decided.setAside.number,
            headSha: decided.setAside.head,
            baseSha,
            reason: 'checks-failed',
            detail: `Its layer ${layerBranch(decided.setAside.number)}, checked ahead of its turn on the tip of ${defaultBranch}, failed ${decided.setAside.name}.`,
            failedChecks: [
              { name: decided.setAside.name, link: decided.setAside.link },
            ],
          },
  };
};

/**
 * Drops every layer there is, for a survey with no candidate to stack: what is
 * left of one, its runs still going and its verdicts, should not wait for the
 * next pull request to be queued.
 */
export const dropAllLayers = async (
  api: ApiContext,
  baseSha: string,
  failing: ReadonlySet<number>,
): Promise<void> => {
  const branches = await readBuiltLayers(baseSha);

  if (Result.isErr(branches)) {
    log(`Cannot read the layer branches: ${branches.value}`);

    return;
  }

  await dropLayers(api, branches.value.built, branches.value.baseTree, failing);
};

/**
 * What the release step is to do this survey: release the first candidate, or
 * wait for its layer; and a pull request to set aside, whose layer went red.
 */
export type Speculation = Readonly<{
  /**
   * Whether any layer stands: then only the first candidate may go, since the
   * layers above carry it.
   */
  stacked: boolean;
  release: boolean;
  setAside: SkipRecord | undefined;
}>;

/** Where the configured workflows stand on a layer. */
type LayerReading = Readonly<{
  status: LayerStatus;
  missing: readonly string[];
  runs: readonly LayerRun[];
  /** When the earliest of its latest runs still going started. */
  runningSince: number | undefined;
  /** A workflow's runs have been cancelled too often to dispatch it again. */
  cancelledTooOften: boolean;
}>;

/** A run on a layer's tip, as much of it as this reads. */
type LayerRun = Readonly<{
  id: number;
  path: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  run_started_at: string | null;
}>;

const RunsSchema = t.record({
  workflow_runs: t.array(
    t.record({
      id: t.number(),
      path: t.string(),
      status: t.string(),
      conclusion: t.union([t.string(), t.nullType]),
      html_url: t.string(),
      run_started_at: t.union([t.string(), t.nullType]),
    }),
  ),
});

const JobsSchema = t.record({
  jobs: t.array(t.record({ name: t.string(), status: t.string() })),
});

/** A job's statuses before a runner has taken it. */
const JOB_NOT_STARTED: ReadonlySet<string> = new Set<string>([
  'queued',
  'waiting',
  'pending',
  'requested',
]);

/** What every check workflow's gate job is named with (`gates / check`). */
const GATE_JOB = 'gates';

/** A run's conclusions that make its layer red. */
const FAILED: ReadonlySet<string> = new Set<string>([
  'failure',
  'timed_out',
  'startup_failure',
  'action_required',
]);

const deleteBranch = async (number: number): Promise<void> => {
  const deleted = await git(
    `git push --quiet origin --delete ${sh(layerBranch(number))}`,
  );

  if (Result.isErr(deleted)) {
    log(`Cannot delete ${layerBranch(number)}: ${deleted.value}`);
  }
};

/** The runs dispatched on a commit, newest included. */
const runsOn = async (
  api: ApiContext,
  sha: string,
): Promise<Result<readonly LayerRun[], string>> =>
  Result.map(
    await rest(api, 'GET', '/actions/runs', RunsSchema, {
      query: { head_sha: sha, event: 'workflow_dispatch', per_page: '100' },
    }),
    (answered) => answered.workflow_runs,
  );

/** Carries out {@link dropActionOf} on each run. Whether all of it was done. */
const dropRuns = async (
  api: ApiContext,
  runs: readonly LayerRun[],
  keepRed: boolean,
): Promise<boolean> => {
  const results = await Promise.all(
    runs.map(async (run) => {
      switch (dropActionOf(run, keepRed)) {
        case 'cancel':
          return rest(
            api,
            'POST',
            `/actions/runs/${run.id}/cancel`,
            t.unknown(),
          );

        case 'delete':
          return rest(api, 'DELETE', `/actions/runs/${run.id}`, t.unknown());

        case 'keep':
          return Result.ok(undefined);
      }
    }),
  );

  const failed = results.filter(Result.isErr);

  for (const each of failed) {
    log(`Cannot drop a layer's run: ${each.value}`);
  }

  return !Arr.isNonEmpty(failed);
};

/**
 * Drops layers no longer standing, and says which could not be, whose branches
 * stay so that a later survey still finds their runs. Such a layer was judged
 * against a base that may never go green, so its verdicts go with its branch,
 * save the red run of a pull request set aside for it ({@link dropActionOf}).
 * Not one whose tree is `main`'s: its pull request merged, and the push to
 * `main` reads that run's artifacts.
 */
const dropLayers = async (
  api: ApiContext,
  stale: readonly BuiltLayer[],
  baseTree: string,
  failing: ReadonlySet<number>,
): Promise<ReadonlySet<number>> => {
  const mut_held = new Set<number>();

  for (const layer of stale) {
    if (layer.tree === baseTree) {
      await deleteBranch(layer.number);

      continue;
    }

    const runs = await runsOn(api, layer.tip);

    const dropped =
      Result.isOk(runs) &&
      (await dropRuns(api, runs.value, failing.has(layer.number)));

    if (!dropped) {
      log(
        `#${layer.number}: its stale layer is kept until its runs are dropped.`,
      );

      mut_held.add(layer.number);

      continue;
    }

    await deleteBranch(layer.number);
  }

  return mut_held;
};

const fallBack = (why: string): Speculation => {
  log(`Not checking ahead this survey (${why}); releasing as usual.`);

  return { stacked: false, release: true, setAside: undefined };
};

/** The layer branches as they stand on `origin`, and `main`'s tree. */
const readBuiltLayers = async (
  baseSha: string,
): Promise<
  Result<Readonly<{ built: readonly BuiltLayer[]; baseTree: string }>, string>
> => {
  const listed = await git(
    `git ls-remote origin ${sh(`refs/heads/${LAYER_BRANCH_PREFIX}*`)}`,
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const tips = Arr.generate(function* () {
    for (const line of listed.value.split('\n')) {
      const [sha, ref] = line.split('\t', 2);

      const number =
        ref === undefined
          ? undefined
          : numberOfLayerBranch(ref.replace(/^refs\/heads\//u, ''));

      if (sha !== undefined && number !== undefined) {
        yield { sha, number };
      }
    }
  });

  // `main`'s tip as well: after a merge it is a squash this clone has not seen.
  // Only what the clone lacks, since this runs every survey.
  const wanted = Arr.toUnshifted(baseSha)(tips.map(({ sha }) => sha));

  const present = await Promise.all(
    wanted.map(async (sha) =>
      Result.isOk(await git(`git cat-file -e ${sh(sha)}`)),
    ),
  );

  const absent = wanted.filter((_, index) => present[index] !== true);

  if (Arr.isNonEmpty(absent)) {
    const fetched = await git(
      `git fetch --quiet origin ${absent.map(sh).join(' ')}`,
    );

    if (Result.isErr(fetched)) {
      return fetched;
    }
  }

  const baseTree = await git(`git log -1 --format=%T ${sh(baseSha)}`);

  if (Result.isErr(baseTree)) {
    return baseTree;
  }

  const built = await Promise.all(
    tips.map(async ({ sha, number }) => {
      const shown = await git(`git log -1 --format=%T%x00%B ${sh(sha)}`);

      const parentTree = await git(`git log -1 --format=%T ${sh(`${sha}^`)}`);

      if (Result.isErr(shown) || Result.isErr(parentTree)) {
        return undefined;
      }

      const [tree, message] = shown.value.split('\0', 2);

      const layer = layerOfMessage(message ?? '');

      return tree === undefined || layer?.number !== number
        ? undefined
        : ({
            ...layer,
            tip: sha,
            tree: tree.trim(),
            parentTree: parentTree.value.trim(),
          } as const);
    }),
  );

  return Result.ok({
    built: built.filter((layer) => layer !== undefined),
    baseTree: baseTree.value.trim(),
  });
};

const buildLayer = async (
  layer: Layer,
  defaultBranch: string,
  worktreeDir: string,
): Promise<Result<BuiltLayer, string>> => {
  const run = async (command: string): Promise<Result<string, string>> =>
    git(command, worktreeDir);

  // The head by its SHA, as the survey read it: `refs/pull/<n>/head` follows a
  // push a little late, and the branch may have moved on since.
  const fetched = await run(
    `git fetch --quiet origin ${sh(layer.head)} ${sh(defaultBranch)}`,
  );

  if (Result.isErr(fetched)) {
    return Result.err(`cannot fetch its head: ${fetched.value}`);
  }

  const parentTree = await run('git log -1 --format=%T HEAD');

  const mergeBase = await run(
    `git merge-base ${sh(`origin/${defaultBranch}`)} ${sh(layer.head)}`,
  );

  if (Result.isErr(parentTree) || Result.isErr(mergeBase)) {
    return Result.err('cannot read its commits');
  }

  // Its own commits, oldest first and merges left out, as the release's
  // `git rebase` replays them, so that the layer's tree is the one its head
  // will have once rebased.
  const commits = await run(
    `git rev-list --reverse --no-merges ${sh(`${mergeBase.value.trim()}..${layer.head}`)}`,
  );

  if (Result.isErr(commits)) {
    return Result.err('cannot list its commits');
  }

  const shas = commits.value.split('\n').filter((sha) => sha !== '');

  const picked = Arr.isNonEmpty(shas)
    ? await run(`git cherry-pick --no-commit ${shas.map(sh).join(' ')}`)
    : Result.ok('');

  if (Result.isErr(picked)) {
    await run('git cherry-pick --abort');

    await run('git reset --hard --quiet');

    return Result.err('its commits conflict with the layers below it');
  }

  const messageFile = path.join(worktreeDir, '..', `layer-${layer.number}.txt`);

  const written = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file of this worker's own state directory.
    fs.writeFile(messageFile, layerMessage(layer)),
  );

  if (Result.isErr(written)) {
    return Result.err(
      `cannot write its commit message: ${unknownToString(written.value)}`,
    );
  }

  const committed = await run(
    `git -c commit.gpgsign=false commit --quiet --allow-empty --no-verify -F ${sh(messageFile)}`,
  );

  // What is left behind is written over by the next build.
  await Result.fromPromise(fs.rm(messageFile, { force: true }));

  if (Result.isErr(committed)) {
    return committed;
  }

  const tip = await run('git rev-parse HEAD');

  const tree = await run('git log -1 --format=%T HEAD');

  if (Result.isErr(tip) || Result.isErr(tree)) {
    return Result.err('cannot read the commit it made');
  }

  const pushed = await run(
    `git push --quiet --force origin ${sh(`HEAD:refs/heads/${layerBranch(layer.number)}`)}`,
  );

  if (Result.isErr(pushed)) {
    return pushed;
  }

  log(
    `#${layer.number}: stacked on ${layerBranch(layer.number)} (${tip.value.trim().slice(0, 10)}).`,
  );

  return Result.ok({
    ...layer,
    tip: tip.value.trim(),
    tree: tree.value.trim(),
    parentTree: parentTree.value.trim(),
  });
};

/**
 * Builds `layers` one on another from `base`, each the pull request's commits
 * on its merge base with the default branch, squashed into one commit carrying
 * the trailer, and pushes each to its branch. Stops at the first that cannot be
 * built — its commits conflict, or its head moved — since everything above it
 * would carry it.
 */
const buildLayers = async (
  layers: readonly Layer[],
  base: string,
  defaultBranch: string,
): Promise<readonly BuiltLayer[]> => {
  // Beside auto-fix's worktrees, under the worker's own state directory.
  const worktreeDir = path.join(WORKTREE_ROOT, 'speculate');

  await removeWorktree(worktreeDir);

  const added = await git(
    `git worktree add --detach ${sh(worktreeDir)} ${sh(base)}`,
  );

  if (Result.isErr(added)) {
    log(
      `Cannot check out ${base.slice(0, 10)} to build layers on: ${added.value}`,
    );

    return [];
  }

  const mut_built: BuiltLayer[] = [];

  for (const layer of layers) {
    const built = await buildLayer(layer, defaultBranch, worktreeDir);

    if (Result.isErr(built)) {
      log(`#${layer.number}: not stacked this survey: ${built.value}`);

      break;
    }

    mut_built.push(built.value);
  }

  await removeWorktree(worktreeDir);

  return mut_built;
};

const hasJobToStart = async (
  api: ApiContext,
  runId: number,
): Promise<boolean> => {
  const answered = await rest(
    api,
    'GET',
    `/actions/runs/${runId}/jobs`,
    JobsSchema,
    { query: { filter: 'latest', per_page: '100' } },
  );

  // Unread is taken as still starting: dispatching more on a guess would crowd
  // the runners the layer below is waiting for.
  return (
    Result.isErr(answered) ||
    answered.value.jobs.some(
      ({ name, status }) =>
        JOB_NOT_STARTED.has(status) ||
        (name.startsWith(GATE_JOB) && status !== 'completed'),
    )
  );
};

/**
 * Whether a run still has jobs to start: not yet in progress, its gate not yet
 * finished (the jobs that follow it do not exist until it does), or a job
 * queued.
 */
const isStillStarting = async (
  api: ApiContext,
  run: LayerRun | undefined,
): Promise<boolean> =>
  run?.status !== 'in_progress' || hasJobToStart(api, run.id);

/**
 * Where the configured workflows stand on a layer: the latest dispatched run of
 * each, read as one status, the workflows still to dispatch (none, or a
 * cancelled one), and the runs, which dropping the layer reads.
 */
const readStatus = async (
  api: ApiContext,
  layer: BuiltLayer,
  workflows: readonly string[],
): Promise<Result<LayerReading, string>> => {
  const answered = await runsOn(api, layer.tip);

  if (Result.isErr(answered)) {
    return answered;
  }

  const runs = answered.value;

  const latest = workflows.map((workflow) => ({
    workflow,
    run: runs
      .filter((run) => run.path.endsWith(`/${workflow}`))
      .toSorted((a, b) => b.id - a.id)[0],
  }));

  const starts = Arr.generate(function* () {
    for (const { run } of latest) {
      if (
        run !== undefined &&
        run.status !== 'completed' &&
        run.run_started_at !== null
      ) {
        yield Date.parse(run.run_started_at);
      }
    }
  });

  const runningSince = Arr.isNonEmpty(starts) ? Math.min(...starts) : undefined;

  const missing = latest
    .filter(({ run }) => run === undefined || run.conclusion === 'cancelled')
    .map(({ workflow }) => workflow);

  const spent = missing.some((workflow) =>
    cancelledTooOften(
      runs
        .filter((run) => run.path.endsWith(`/${workflow}`))
        .map((run) => run.conclusion),
    ),
  );

  const reading = {
    missing,
    runs,
    runningSince,
    cancelledTooOften: spent,
  } as const;

  const failed = latest.find(({ run }) => FAILED.has(run?.conclusion ?? ''));

  if (failed?.run !== undefined) {
    return Result.ok({
      ...reading,
      status: { kind: 'red', name: failed.workflow, link: failed.run.html_url },
    });
  }

  if (Arr.isNonEmpty(missing)) {
    return Result.ok({ ...reading, status: { kind: 'not-dispatched' } });
  }

  const running = latest.filter(({ run }) => run?.status !== 'completed');

  if (!Arr.isNonEmpty(running)) {
    return Result.ok({ ...reading, status: { kind: 'green' } });
  }

  const queued = await Promise.all(
    running.map(async ({ run }) => isStillStarting(api, run)),
  );

  return Result.ok({
    ...reading,
    status: { kind: 'running', queued: queued.includes(true) },
  });
};

/** {@link readStatus} of each of `layers`, in order, or which could not be read. */
const readStatusesOf = async (
  api: ApiContext,
  layers: readonly BuiltLayer[],
  workflows: readonly string[],
): Promise<Result<readonly LayerReading[], string>> => {
  const statuses = await Promise.all(
    layers.map(async (layer) => readStatus(api, layer, workflows)),
  );

  const unread = statuses.findIndex(Result.isErr);

  if (unread !== -1) {
    return Result.err(
      `cannot read the runs on ${layerBranch(layers[unread]?.number ?? 0)}`,
    );
  }

  return Result.ok(statuses.filter(Result.isOk).map(({ value }) => value));
};

/**
 * Whether every job that failed on a layer's tip is one a configured fixer
 * settles, as `autoFix` would read them on the pull request's head.
 */
const isFixersOwn = async (
  api: ApiContext,
  tip: string,
  config: AutoFixConfig | undefined,
): Promise<Result<boolean, string>> =>
  Result.map(await listCheckRuns(api, tip), (runs) =>
    Result.isOk(planAutoFix(statesFromCheckRuns(runs), config)),
  );

const dispatch = async (
  api: ApiContext,
  workflow: string,
  number: number,
): Promise<Result<unknown, string>> =>
  // A path segment as it stands: `configOf` holds it to a file name.
  rest(api, 'POST', `/actions/workflows/${workflow}/dispatches`, t.unknown(), {
    body: { ref: layerBranch(number), inputs: { 'diff-parent': 'true' } },
  });
