/**
 * The layers a pull request carries along when its branch moves
 * (`spec/worker.md`, "Picking"): every open one stacked on it, however high,
 * each rebased onto the new head of the one below.
 */

import { Arr, Result } from 'ts-data-forge';
import type { Read } from '../snapshot/index.mjs';
import { holdingClaim } from './claim-pr.mjs';
import { stackDescendants } from './graph.mjs';
import type { QueueComments } from './set-aside.mjs';

/**
 * The open pull requests stacked on pull request `number`, however high, each
 * after the one it is on: of a queue's decisions (`PullRequestDecision`), those
 * entries.
 */
export const layersAbove = <
  P extends Readonly<{
    facts: Readonly<{ number: number }>;
    stackedOn: number | undefined;
  }>,
>(
  pullRequests: readonly P[],
  number: number,
): readonly P[] => {
  const parents = new Map(
    Arr.generate(function* () {
      for (const { facts, stackedOn } of pullRequests) {
        if (stackedOn !== undefined) {
          yield [facts.number, stackedOn] as const;
        }
      }
    }),
  );

  return stackDescendants(parents, number).flatMap((above) =>
    pullRequests.filter(({ facts }) => facts.number === above),
  );
};

/**
 * Whether a layer may be carried along, by its comments: `free`, or held by a
 * claim (whose), or `unread`, nothing known of a claim on it, which is held
 * too. A restack moves the head, which ends a claim, and the fix it is for
 * would be built on a head gone; every command that restacks asks this.
 */
export const layerHold = (comments: Read<QueueComments>): LayerHold => {
  if (Result.isErr(comments)) {
    return { kind: 'unread' };
  }

  const claim = holdingClaim(comments.value.claim);

  return claim === undefined
    ? { kind: 'free' }
    : { kind: 'claimed', by: claim.by };
};

/**
 * Why a layer is not carried along, or `undefined` when it is: a fork's branch
 * is never pushed to (`spec/worker.md`, "Invariants").
 */
export const restackRefusal = (
  layer: Readonly<{ fromFork: boolean }>,
): string | undefined =>
  layer.fromFork ? 'its branch is in a fork' : undefined;

export type LayerHold = Readonly<
  { kind: 'claimed'; by: string } | { kind: 'free' } | { kind: 'unread' }
>;
