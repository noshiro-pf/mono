/**
 * Carrying the layers stacked on a branch along after it moved
 * (`spec/worker.md`, "Picking"): the worker after a rebase, and `push-fixed-pr`
 * and `rework-pr` after a session's push.
 */

import { restackRefusal } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import {
  rebaseOntoAndPush,
  sweepStaleWorktrees,
  type GitPlace,
} from './git.mjs';

/**
 * Carries every layer in `layers` (each after the one it is on, as
 * `layersAbove` gives them) along after `moved` went from its old head to its
 * new one: each is rebased `--onto` the new head of the one below from its old
 * head, and pushed leased. A layer that cannot be moved, or that someone else
 * moved first, is left where it is, and so is everything on it; none of this
 * undoes the move below.
 */
export const restack = async (
  place: GitPlace,
  moved: Readonly<{ branch: string; from: string; to: string }>,
  layers: readonly RestackLayer[],
): Promise<readonly RestackOutcome[]> => {
  const mut_movedTo = new Map<string, Readonly<{ from: string; to: string }>>([
    [moved.branch, { from: moved.from, to: moved.to }],
  ]);

  // A restack is where worktrees are made, so it is where a killed run's are
  // cleared.
  if (Arr.isNonEmpty(layers)) {
    await sweepStaleWorktrees(place.cwd, place.worktreeRoot, Date.now());
  }

  const mut_outcomes: RestackOutcome[] = [];

  for (const layer of layers) {
    // Each layer waits for the one below it: its new base is that one's push.
    // eslint-disable-next-line no-await-in-loop
    const outcome = await restackOne(
      place,
      layer,
      mut_movedTo.get(layer.baseRef),
    );

    if (outcome.kind === 'restacked') {
      mut_movedTo.set(layer.headRef, { from: layer.headSha, to: outcome.head });
    }

    mut_outcomes.push(outcome);
  }

  return mut_outcomes;
};

/** What a restack reads of a layer: of the snapshot's facts, these. */
export type RestackLayer = Readonly<{
  number: number;
  headRef: string;
  headSha: string;
  baseRef: string;
  fromFork: boolean;
}>;

/** One layer's outcome: moved to `head`, or left, and why. */
export type RestackOutcome = Readonly<
  | { number: number; kind: 'restacked'; head: string }
  | { number: number; kind: 'left'; reason: string }
>;

/** How {@link restack}'s outcomes read, one line each. */
export const restackLines = (
  outcomes: readonly RestackOutcome[],
): readonly string[] =>
  outcomes.map((outcome) =>
    outcome.kind === 'restacked'
      ? `#${outcome.number}: restacked at ${outcome.head.slice(0, 10)}.`
      : `#${outcome.number}: not restacked — ${outcome.reason}.`,
  );

const restackOne = async (
  place: GitPlace,
  layer: RestackLayer,
  below: Readonly<{ from: string; to: string }> | undefined,
): Promise<RestackOutcome> => {
  const { number } = layer;

  if (below === undefined) {
    return {
      number,
      kind: 'left',
      reason: `the layer it is on, ${layer.baseRef}, did not move`,
    };
  }

  const refused = restackRefusal(layer);

  if (refused !== undefined) {
    return { number, kind: 'left', reason: refused };
  }

  const rebased = await rebaseOntoAndPush(place, {
    number,
    branch: layer.headRef,
    head: layer.headSha,
    onto: below.to,
    upstream: below.from,
  });

  return Result.isErr(rebased)
    ? { number, kind: 'left', reason: rebased.value }
    : rebased.value.kind === 'moved'
      ? {
          number,
          kind: 'left',
          reason:
            'its branch moved since it was read, so someone else is moving it',
        }
      : { number, kind: 'restacked', head: rebased.value.head };
};
