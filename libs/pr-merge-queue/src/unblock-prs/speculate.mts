// cspell:ignore gpgsign

/**
 * Checking queued pull requests ahead of their turn: reading the layer branches
 * and the runs on them, building and dispatching layers, and cleaning up the
 * ones no longer valid. What is decided is `speculate-plan.mts`'s;
 * this is the reading and the moving.
 *
 * Every survey starts from what GitHub holds, so a worker restarted mid-stack
 * picks up where the branches are. A step that fails is logged and leaves the
 * first candidate to be released as it would be without any of this: the worst
 * that does is a matrix run twice.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  currentEpochMs,
  git,
  log,
  rest,
  sh,
  type ApiContext,
} from '../lib/index.mjs';
import { planAutoFixFromRuns, WORKTREE_ROOT } from './auto-fix.mjs';
import type { AutoFixConfig, SpeculateConfig } from './config.mjs';
import {
  listCheckRuns,
  readAnnotationTitles,
  removeWorktree,
} from './github.mjs';
import {
  cancelledTooOften,
  decideSpeculation,
  desiredLayers,
  isStuck,
  LAYER_BRANCH_PREFIX,
  layerBranch,
  layerMessage,
  layerOfMessage,
  matchLayers,
  MAX_DISPATCHES,
  mayBuildAbove,
  numberOfLayerBranch,
  planDrop,
  stackedFirst,
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
    /**
     * The head each pull request set aside for a failure was set aside at,
     * whose layer at that head is left to finish (`planDrop`).
     */
    setAside: ReadonlyMap<number, string>;
    /** Whether a candidate may stay ahead of the order (`stackedFirst`). */
    mayStayAhead: (pr: PullRequest) => boolean;
  }>,
): Promise<Speculation> => {
  const { defaultBranch, baseSha, config } = context;

  const branches = await readBuiltLayers(baseSha);

  if (Result.isErr(branches)) {
    return fallBack(
      `cannot read the layer branches: ${branches.value}`,
      context.candidates,
    );
  }

  // What is stacked stays ahead; the rest follows in the queue's order.
  const candidates = stackedFirst(
    context.candidates,
    branches.value.built,
    branches.value.baseTree,
    {
      mayStayAhead: context.mayStayAhead,
      defaultBranch,
      bypass: context.bypass,
    },
  );

  const desired = desiredLayers(candidates, {
    defaultBranch,
    bypass: context.bypass,
    depth: config.depth,
  });

  const { kept, toBuild, stale } = matchLayers({
    desired,
    built: branches.value.built,
    baseTree: branches.value.baseTree,
  });

  await dropLayers(api, stale, context.setAside);

  const keptStatuses = await readStatusesOf(api, kept, config.workflows);

  if (Result.isErr(keptStatuses)) {
    return fallBack(keptStatuses.value, candidates);
  }

  const buildable = mayBuildAbove(
    keptStatuses.value.map(({ status }) => status),
  )
    ? toBuild
    : ([] as const);

  const builtNow = Arr.isNonEmpty(buildable)
    ? await buildLayers(buildable, kept.at(-1)?.tip ?? baseSha, defaultBranch)
    : ([] as const);

  const builtStatuses = await readStatusesOf(api, builtNow, config.workflows);

  if (Result.isErr(builtStatuses)) {
    return fallBack(builtStatuses.value, candidates);
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

      await dropLayer(api, layer.number, false, read[index]?.runs ?? []);
    }
  }

  // A failure the configured fixers can settle is left to the release, as it
  // always has been: `watchAndFix` reads the jobs on the pull request's own
  // head, so the layer's runs are deleted, or the gate reuses their verdict and
  // leaves no job there to read. Should a delete be refused, or the jobs not be
  // read, the release is still the way on: at worst it is set aside there, for
  // what its own checks say, where waiting here could hold the queue.
  if (decided.setAside !== undefined && layers[0] !== undefined) {
    const fixersOwn = await isFixersOwn(api, layers[0].tip, context.autoFix);

    if (Result.isErr(fixersOwn)) {
      return fallBack(
        `cannot read its layer's jobs: ${fixersOwn.value}`,
        candidates,
      );
    }

    if (fixersOwn.value) {
      log(
        `#${decided.setAside.number}: only fixers' diffs failed on its layer; releasing it, for the release's own run to fix.`,
      );

      // The branch stays while a run could not be cancelled, as `dropLayer`
      // keeps it.
      if (await deleteRuns(api, decided.setAside.number, read[0]?.runs ?? [])) {
        await deleteBranch(decided.setAside.number);
      }

      return {
        stacked: false,
        release: true,
        setAside: undefined,
        order: candidates,
      };
    }
  }

  const firstStatus = read[0];

  // Before dispatching more: a survey that gives up on the stack should not
  // have just started runs on it.
  if (
    firstStatus !== undefined &&
    !decided.release &&
    isStuck(firstStatus.status, firstStatus.since, currentEpochMs())
  ) {
    return fallBack(
      `${layerBranch(layers[0]?.number ?? 0)} has been running for too long`,
      candidates,
    );
  }

  if (decided.dispatch !== undefined) {
    const layer = layers[decided.dispatch];

    const missing = read[decided.dispatch]?.missing ?? [];

    if (read[decided.dispatch]?.cancelledTooOften === true) {
      const why =
        `${layerBranch(layer?.number ?? 0)} has had a workflow cancelled ${MAX_DISPATCHES} times` as const;

      if (decided.dispatch === 0) {
        return fallBack(why, candidates);
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
            return fallBack(
              `cannot dispatch ${workflow}: ${dispatched.value}`,
              candidates,
            );
          }

          log(
            `#${layer.number}: cannot dispatch ${workflow}; trying again on the next survey: ${dispatched.value}`,
          );

          break;
        }
      }
    }
  }

  // Its runs stay, those still going left to finish, and its branch goes once
  // they have (`planDrop`).
  if (decided.setAside !== undefined) {
    await dropLayer(api, decided.setAside.number, true, read[0]?.runs ?? []);
  }

  if (!decided.release && candidates[0] !== undefined) {
    const queueFirst = context.candidates[0]?.number;

    log(
      `#${candidates[0].number}: waiting for its layer's checks before releasing it${queueFirst === candidates[0].number ? '' : `, stacked ahead of #${queueFirst}, which the queue's own order puts first`}.`,
    );
  }

  return {
    stacked: Arr.isNonEmpty(layers),
    release: decided.release,
    order: candidates,
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
  setAside: ReadonlyMap<number, string>,
): Promise<void> => {
  const branches = await readBuiltLayers(baseSha);

  if (Result.isErr(branches)) {
    log(`Cannot read the layer branches: ${branches.value}`);

    return;
  }

  await dropLayers(api, branches.value.built, setAside);
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
  /**
   * The candidates as checking ahead orders them, what is stacked first
   * (`stackedFirst`), which the release step releases from (`releasing`).
   */
  order: readonly PullRequest[];
}>;

/** Where the configured workflows stand on a layer. */
type LayerReading = Readonly<{
  status: LayerStatus;
  missing: readonly string[];
  runs: readonly LayerRun[];
  /**
   * When the earliest of its latest runs still going was dispatched, the
   * earliest of those still waiting for a runner, and when the oldest of their
   * jobs still running started.
   */
  since: Readonly<{
    dispatched?: number;
    waiting?: number;
    oldestJobRunning?: number;
  }>;
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
  /** When it was dispatched, which is when GitHub says it started. */
  run_started_at: string;
  updated_at: string;
}>;

const RunsSchema = t.record({
  workflow_runs: t.array(
    t.record({
      id: t.number(),
      path: t.string(),
      status: t.string(),
      conclusion: t.union([t.string(), t.nullType]),
      html_url: t.string(),
      run_started_at: t.optional(t.union([t.string(), t.nullType])),
      created_at: t.string(),
      updated_at: t.string(),
    }),
  ),
});

const JobsSchema = t.record({
  jobs: t.array(
    t.record({
      name: t.string(),
      status: t.string(),
      started_at: t.optional(t.union([t.string(), t.nullType])),
    }),
  ),
});

/** A job's statuses before a runner has taken it. */
const JOB_NOT_STARTED: ReadonlySet<string> = new Set<string>([
  'queued',
  'waiting',
  'pending',
  'requested',
]);

/** A run's conclusions that make its layer red. */
const FAILED: ReadonlySet<string> = new Set<string>([
  'failure',
  'timed_out',
  'startup_failure',
  'action_required',
]);

/** What every check workflow's gate job is named with (`gates / check`). */
const GATE_JOB = 'gates';

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
    (answered) =>
      answered.workflow_runs.map(
        ({ run_started_at, created_at, ...run }) =>
          ({ ...run, run_started_at: run_started_at ?? created_at }) as const,
      ),
  );

/**
 * Fetches, in one go, those of `shas` this clone lacks. Whether it could; a sha
 * still missing afterwards is for the caller to find.
 */
const fetchMissing = async (
  shas: readonly string[],
): Promise<Result<unknown, string>> => {
  const present = await Promise.all(
    shas.map(async (sha) =>
      Result.isOk(await git(`git cat-file -e ${sh(sha)}`)),
    ),
  );

  const absent = shas.filter((_, index) => present[index] !== true);

  return Arr.isNonEmpty(absent)
    ? git(`git fetch --quiet origin ${absent.map(sh).join(' ')}`)
    : Result.ok(undefined);
};

/**
 * Carries out {@link planDrop} for one layer: cancels what it asks, then deletes
 * the branch when it may and every cancel went through. A cancel refused is
 * logged, and the branch stays for the next survey to cancel it again, unless
 * that survey builds the layer anew over it: the run is then left to finish,
 * holding a runner, its verdict a true one.
 */
const dropLayer = async (
  api: ApiContext,
  number: number,
  setAside: boolean,
  runs: readonly LayerRun[],
): Promise<void> => {
  const plan = planDrop(setAside, runs, currentEpochMs());

  const cancelled = await Promise.all(
    plan.cancel.map(async (id) =>
      rest(api, 'POST', `/actions/runs/${id}/cancel`, t.unknown()),
    ),
  );

  for (const each of cancelled) {
    if (Result.isErr(each)) {
      log(`#${number}: cannot cancel a run of its layer: ${each.value}`);
    }
  }

  // Not while a run it could not cancel may still start a job, which would look
  // for the branch's commit: the next survey cancels it again.
  if (plan.deleteBranch && !cancelled.some(Result.isErr)) {
    await deleteBranch(number);
  }
};

/**
 * Cleans up the layers no longer valid: their runs read together, and each
 * cleaned up in turn, since each deletes a branch with a `git push` from one
 * clone. One whose runs cannot be read keeps its branch for a later survey,
 * unless this survey builds it anew: its runs are then left to finish, holding
 * runners, their verdicts true ones.
 */
const dropLayers = async (
  api: ApiContext,
  stale: readonly BuiltLayer[],
  setAside: ReadonlyMap<number, string>,
): Promise<void> => {
  const read = await Promise.all(
    stale.map(async (layer) => [layer, await runsOn(api, layer.tip)] as const),
  );

  for (const [layer, runs] of read) {
    if (Result.isErr(runs)) {
      log(`#${layer.number}: cannot read the runs of its old layer.`);

      continue;
    }

    await dropLayer(
      api,
      layer.number,
      setAside.get(layer.number) === layer.head,
      runs.value,
    );
  }
};

/**
 * Deletes a layer's runs, so that the gate reuses no verdict of them: for a
 * failure left to the release, whose own run has to fail where `watchAndFix`
 * can read the jobs, its runs still going cancelled. A refusal is logged; the
 * release then may find the old verdict, and is set aside there as before.
 * Whether every run was dealt with.
 */
const deleteRuns = async (
  api: ApiContext,
  number: number,
  runs: readonly LayerRun[],
): Promise<boolean> => {
  const done = await Promise.all(
    runs.map(async ({ id, status }) =>
      status === 'completed'
        ? ([
            'delete',
            await rest(api, 'DELETE', `/actions/runs/${id}`, t.unknown()),
          ] as const)
        : ([
            'cancel',
            await rest(api, 'POST', `/actions/runs/${id}/cancel`, t.unknown()),
          ] as const),
    ),
  );

  for (const [action, each] of done) {
    if (Result.isErr(each)) {
      log(`#${number}: cannot ${action} a run of its layer: ${each.value}`);
    }
  }

  return done.every(([, each]) => Result.isOk(each));
};

const fallBack = (why: string, order: readonly PullRequest[]): Speculation => {
  log(`Not checking ahead this survey (${why}); releasing as usual.`);

  return { stacked: false, release: true, setAside: undefined, order };
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

  const fetched = await fetchMissing(wanted);

  if (Result.isErr(fetched)) {
    return fetched;
  }

  const baseTree = await git(`git log -1 --format=%T ${sh(baseSha)}`);

  if (Result.isErr(baseTree)) {
    return baseTree;
  }

  const built = await Promise.all(
    tips.map(async ({ sha, number }) => {
      const shown = await git(`git log -1 --format=%T%x00%ct%x00%B ${sh(sha)}`);

      const below = await git(`git log -1 --format=%H%x00%T ${sh(`${sha}^`)}`);

      if (Result.isErr(shown) || Result.isErr(below)) {
        return undefined;
      }

      const [tree, committed, message] = shown.value.split('\0', 3);

      const [parent, parentTree] = below.value.trim().split('\0', 2);

      const layer = layerOfMessage(message ?? '');

      // An unreadable time reads as no layer, as an unreadable message does.
      const committedAt = Num.safeParseInt(committed ?? '');

      return tree === undefined ||
        parent === undefined ||
        parentTree === undefined ||
        Result.isErr(committedAt) ||
        layer?.number !== number
        ? undefined
        : ({
            ...layer,
            tip: sha,
            tree: tree.trim(),
            parent,
            parentTree,
            builtAt: committedAt.value * 1000,
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

  const below = await run('git log -1 --format=%H%x00%T HEAD');

  const mergeBase = await run(
    `git merge-base ${sh(`origin/${defaultBranch}`)} ${sh(layer.head)}`,
  );

  if (Result.isErr(below) || Result.isErr(mergeBase)) {
    return Result.err('cannot read its commits');
  }

  const [parent, parentTree] = below.value.trim().split('\0', 2);

  if (parent === undefined || parentTree === undefined) {
    return Result.err('cannot read the commit below');
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

  const made = await run('git log -1 --format=%T%x00%ct HEAD');

  if (Result.isErr(tip) || Result.isErr(made)) {
    return Result.err('cannot read the commit it made');
  }

  const [tree, time] = made.value.trim().split('\0', 2);

  const committedAt = Num.safeParseInt(time ?? '');

  if (tree === undefined || Result.isErr(committedAt)) {
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
    tree,
    parent,
    parentTree,
    // The commit's time, as `readBuiltLayers` reads it back.
    builtAt: committedAt.value * 1000,
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

/**
 * Whether a run still has jobs to start: not yet in progress, its gate not yet
 * finished (the jobs that follow it do not exist until it does), or a job
 * queued; and when the oldest of its jobs still running started. Unread, it is taken as
 * still starting: dispatching more on a guess would crowd the runners the layer
 * below is waiting for.
 */
const startingOf = async (
  api: ApiContext,
  run: LayerRun,
): Promise<
  Readonly<{ starting: boolean; forRunner: boolean; oldestRunning?: number }>
> => {
  if (run.status !== 'in_progress') {
    return { starting: true, forRunner: true };
  }

  const answered = await rest(
    api,
    'GET',
    `/actions/runs/${run.id}/jobs`,
    JobsSchema,
    { query: { filter: 'latest', per_page: '100' } },
  );

  if (Result.isErr(answered)) {
    return { starting: true, forRunner: true };
  }

  const { jobs } = answered.value;

  const starts = Arr.generate(function* () {
    for (const { status, started_at } of jobs) {
      if (
        status === 'in_progress' &&
        started_at !== null &&
        started_at !== undefined
      ) {
        yield Date.parse(started_at);
      }
    }
  });

  return {
    starting: jobs.some(
      ({ name, status }) =>
        JOB_NOT_STARTED.has(status) ||
        (name.startsWith(GATE_JOB) && status !== 'completed'),
    ),
    // Only `queued` waits for a runner: `waiting` and `pending` wait for the
    // jobs they need, such as an aggregate for its matrix.
    forRunner: jobs.some(({ status }) => status === 'queued'),
    ...(Arr.isNonEmpty(starts) ? { oldestRunning: Math.min(...starts) } : {}),
  };
};

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

  const going = Arr.generate(function* () {
    for (const { run } of latest) {
      if (run !== undefined && run.status !== 'completed') {
        yield run;
      }
    }
  });

  const dispatches = going.map(({ run_started_at }) =>
    Date.parse(run_started_at),
  );

  const dispatched = Arr.isNonEmpty(dispatches)
    ? Math.min(...dispatches)
    : undefined;

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
    since: dispatched === undefined ? ({} as const) : ({ dispatched } as const),
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

  if (!Arr.isNonEmpty(going)) {
    return Result.ok({ ...reading, status: { kind: 'green' } });
  }

  const starting = await Promise.all(
    going.map(async (run) => startingOf(api, run)),
  );

  const runningStarts = Arr.generate(function* () {
    for (const { oldestRunning } of starting) {
      if (oldestRunning !== undefined) {
        yield oldestRunning;
      }
    }
  });

  // The dispatches of the runs still waiting for a runner, apart from those of
  // the others, so that one run's wait is not charged to another's start.
  const waitingDispatches = Arr.generate(function* () {
    for (const [index, run] of going.entries()) {
      if (starting[index]?.forRunner === true) {
        yield Date.parse(run.run_started_at);
      }
    }
  });

  return Result.ok({
    ...reading,
    since: {
      ...reading.since,
      ...(Arr.isNonEmpty(waitingDispatches)
        ? { waiting: Math.min(...waitingDispatches) }
        : {}),
      ...(Arr.isNonEmpty(runningStarts)
        ? { oldestJobRunning: Math.min(...runningStarts) }
        : {}),
    },
    status: {
      kind: 'running',
      queued: starting.some((each) => each.starting),
    },
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
 * settles, as `autoFix` would read them on the pull request's head: by the same
 * plan, which declines a job whose run says its command failed.
 */
const isFixersOwn = async (
  api: ApiContext,
  tip: string,
  config: AutoFixConfig | undefined,
): Promise<Result<boolean, string>> => {
  const runs = await listCheckRuns(api, tip);

  if (Result.isErr(runs)) {
    return runs;
  }

  const plan = await planAutoFixFromRuns(runs.value, config, async (id) =>
    readAnnotationTitles(api, id),
  );

  return Result.ok(Result.isOk(plan));
};

const dispatch = async (
  api: ApiContext,
  workflow: string,
  number: number,
): Promise<Result<unknown, string>> =>
  // A path segment as it stands: `configOf` holds it to a file name.
  rest(api, 'POST', `/actions/workflows/${workflow}/dispatches`, t.unknown(), {
    // No `diff-parent`: the run diffs against `main`, as a pull request's does,
    // so that its verdict is a whole one about the tree.
    body: { ref: layerBranch(number) },
  });
