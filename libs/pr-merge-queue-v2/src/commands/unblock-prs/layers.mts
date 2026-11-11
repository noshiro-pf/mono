/**
 * The work on the `queue/pr-<N>` layers a cycle planned (`spec/worker.md`,
 * "Checking ahead"), done before its step: drop, build, dispatch. Whether the
 * cycle goes on with its step, or falls back to releasing as without checking
 * ahead: a build that fails on the first layer of the stack, or a dispatch on
 * the first layer that fails, would hold the first candidate for ever.
 */

import {
  cancelRun,
  deleteRun,
  dispatchWorkflow,
  type LayerDrop,
  type LayerWork,
  type PullRequestDecision,
  type ReadContext,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { StrictOmit } from 'ts-type-forge';
import type { BuiltLayers, LayerToBuild } from '../../git/index.mjs';
import { messageOf } from '../../github/index.mjs';

/** Does `work`: `fall-back` when the cycle's step is to be taken without layers. */
export const executeLayerWork = async (
  work: LayerWork,
  decisionOf: (number: number) => PullRequestDecision | undefined,
  world: LayerWorld,
): Promise<'fall-back' | 'go-on'> => {
  // The plan builds layers from its own decision, so each has its pull request
  // there; one that does not makes the whole plan one to distrust, its drops
  // included, which cancel runs and delete branches: not a branch to guess or a
  // layer to skip. The cycle releases as usual, dry run or not. A layer left
  // standing is dropped by the first plan that is whole again; should the
  // mismatch last, runs and `queue/pr-*` branches stay meanwhile, which costs
  // CI minutes, where acting on a plan known to be wrong could cancel the runs
  // of healthy layers. The log line says which pull request is missing.
  const named = withBranches(work.build, decisionOf);

  if (Result.isErr(named)) {
    world.log(
      `Not checking ahead this cycle (#${named.value} is not among the pull requests decided); releasing as usual.`,
    );

    return 'fall-back';
  }

  if (world.dryRun) {
    for (const line of dryRunLines(work)) {
      world.log(line);
    }

    return 'go-on';
  }

  for (const drop of work.drops) {
    // eslint-disable-next-line no-await-in-loop -- each deletes a branch with a push from one clone
    await dropLayer(drop, world);
  }

  const { dispatch } = work;

  const build = named.value;

  const built =
    build === undefined
      ? undefined
      : await world.buildLayers(build.base, world.defaultBranch, build.layers);

  if (built?.failed !== undefined) {
    world.log(
      `#${built.failed.number}: not stacked this cycle: ${built.failed.why}`,
    );

    if (
      build?.onTip === true &&
      built.failed.number === build.layers[0]?.number
    ) {
      world.log(
        'Not checking ahead this cycle (the first layer could not be built); releasing as usual.',
      );

      return 'fall-back';
    }
  }

  const notBuilt: readonly number[] =
    build === undefined || built === undefined
      ? ([] as const)
      : build.layers
          .map(({ number }) => number)
          .filter((number) => !built.built.includes(number));

  if (dispatch === undefined || notBuilt.includes(dispatch.number)) {
    return 'go-on';
  }

  world.log(
    `#${dispatch.number}: dispatching ${dispatch.workflows.join(', ')} on ${dispatch.branch}.`,
  );

  for (const workflow of dispatch.workflows) {
    // eslint-disable-next-line no-await-in-loop -- one at a time, stopping at a refusal
    const dispatched = await dispatchWorkflow(
      world.context,
      workflow,
      dispatch.branch,
    );

    if (Result.isErr(dispatched)) {
      const why =
        `cannot dispatch ${workflow} on ${dispatch.branch}: ${messageOf(dispatched.value)}` as const;

      if (dispatch.first) {
        world.log(
          `Not checking ahead this cycle (${why}); releasing as usual.`,
        );

        return 'fall-back';
      }

      world.log(`#${dispatch.number}: ${why}; trying again next cycle.`);

      return 'go-on';
    }
  }

  return 'go-on';
};

export type LayerWorld = Readonly<{
  context: ReadContext;
  dryRun: boolean;
  log: (line: string) => void;
  defaultBranch: string;
  buildLayers: (
    base: string,
    defaultBranch: string,
    layers: readonly LayerToBuild[],
  ) => Promise<BuiltLayers>;
  deleteBranch: (branch: string) => Promise<Result<undefined, string>>;
}>;

/**
 * `build` with each layer's pull request's branch; or the first layer whose
 * pull request is not among those decided.
 */
const withBranches = (
  build: LayerWork['build'],
  decisionOf: (number: number) => PullRequestDecision | undefined,
): Result<
  | (StrictOmit<NonNullable<LayerWork['build']>, 'layers'> &
      Readonly<{ layers: readonly LayerToBuild[] }>)
  | undefined,
  number
> => {
  if (build === undefined) {
    return Result.ok(undefined);
  }

  const mut_layers: LayerToBuild[] = [];

  for (const layer of build.layers) {
    const decision = decisionOf(layer.number);

    if (decision === undefined) {
      return Result.err(layer.number);
    }

    mut_layers.push({ ...layer, branch: decision.facts.headRef });
  }

  return Result.ok({ ...build, layers: mut_layers });
};

/** What a dry run would do. */
const dryRunLines = (work: LayerWork): readonly string[] =>
  [
    ...work.drops.map(
      ({ number, cancel, deleteRuns, deleteBranch }) =>
        `#${number}: would drop its layer (cancelling ${cancel.length}, deleting ${deleteRuns.length} runs${deleteBranch ? ', deleting its branch' : ''}).`,
    ),
    ...(work.build === undefined
      ? ([] as const)
      : ([
          `Would stack ${work.build.layers.map(({ number }) => `#${number}`).join(', ')} on ${work.build.base.slice(0, 10)}.`,
        ] as const)),
    ...(work.dispatch === undefined
      ? ([] as const)
      : ([
          `#${work.dispatch.number}: would dispatch ${work.dispatch.workflows.join(', ')} on ${work.dispatch.branch}.`,
        ] as const)),
  ] as const;

/**
 * Drops one layer: its runs cancelled and deleted as the plan says, then its
 * branch, unless a cancel was refused: a run still to start a job would look
 * for the commit, and the next cycle cancels it again.
 */
const dropLayer = async (drop: LayerDrop, world: LayerWorld): Promise<void> => {
  world.log(`#${drop.number}: dropping its layer ${drop.branch}.`);

  const done = await Promise.all([
    ...drop.cancel.map(
      async (runId) =>
        ['cancel', runId, await cancelRun(world.context, runId)] as const,
    ),
    ...drop.deleteRuns.map(
      async (runId) =>
        ['delete', runId, await deleteRun(world.context, runId)] as const,
    ),
  ]);

  const refused = done.filter((entry) => Result.isErr(entry[2]));

  for (const [action, runId, each] of refused) {
    if (Result.isErr(each)) {
      world.log(
        `#${drop.number}: cannot ${action} run ${runId} of its layer: ${messageOf(each.value)}`,
      );
    }
  }

  if (!drop.deleteBranch || Arr.isNonEmpty(refused)) {
    return;
  }

  const deleted = await world.deleteBranch(drop.branch);

  if (Result.isErr(deleted)) {
    world.log(`Cannot delete ${drop.branch}: ${deleted.value}`);
  }
};
