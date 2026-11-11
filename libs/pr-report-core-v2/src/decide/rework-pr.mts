/**
 * What `rework-pr` does with the pull request of the current branch
 * (`spec/commands.md`, `rework-pr`): whether it may be reworked at all, and
 * which steps `start` and `done` have left to take, in order.
 */

import { Arr, Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { hasLabel, PullRequestLabel } from '../conventions/index.mjs';
import type { PullRequestFacts } from '../snapshot/index.mjs';
import { holdingClaim } from './claim-pr.mjs';
import type { PullRequestDecision } from './queue.mjs';
import { layerHold, layersAbove } from './stack.mjs';

/**
 * Whether pull request `number` of the queue read (`pullRequests`) may be
 * reworked: its facts, and the layers stacked on it to carry along, or why not.
 *
 * One a skill is to fix, or someone has claimed, is taken up with `claim-pr`
 * and handed back with `push-fixed-pr`: the claim is what keeps everyone else
 * off it, and a push from here would end it. The claim is asked about as well
 * as the owner, for a claim on a pull request the queue does not cover has no
 * owner to report it. Comments that cannot be read are refused, as
 * `push-fixed-pr` refuses them: nothing is known of a claim on it.
 *
 * A layer above that a claim holds on, or whose comments cannot be read, is not
 * carried along, and so nothing above it is: a restack leaves what sits on a
 * layer that did not move.
 */
export const decideReworkStanding = <F extends ReworkFacts>(
  pullRequests: readonly ReworkPullRequest<F>[],
  number: number,
): Result<ReworkStanding<F>, string> => {
  const pr = pullRequests.find(({ facts }) => facts.number === number);

  if (pr === undefined) {
    return Result.err('it is not among the open pull requests the queue reads');
  }

  const { owner, comments } = pr;

  if (Result.isErr(comments)) {
    return Result.err(
      `its queue comments could not be read (${comments.value.what}: ${comments.value.message}), so whether someone has claimed it is not known`,
    );
  }

  const claim = holdingClaim(comments.value.claim);

  if (claim !== undefined) {
    return Result.err(
      `${claim.by} claimed it at ${claim.at}. A fix under a claim goes through push-fixed-pr; otherwise wait for the claim to end`,
    );
  }

  // The owner is decided from the comments, so it is read when they are.
  if (Result.isOk(owner) && owner.value?.owner === 'skill') {
    return Result.err(
      `it is a skill's (${owner.value.reason}). Claim it with claim-pr and hand it back with push-fixed-pr`,
    );
  }

  const layers = layersAbove(pullRequests, number);

  const isHeld = ({ comments: read }: ReworkPullRequest<F>): boolean =>
    layerHold(read).kind !== 'free';

  return Result.ok({
    pr: pr.facts,
    layers: layers.filter((layer) => !isHeld(layer)).map(({ facts }) => facts),
    held: layers.filter(isHeld).map(({ facts }) => facts.number),
  });
};

/** What `start` has left to do to the pull request, in order. */
export const startSteps = (state: ReworkState): readonly ReworkStep[] =>
  Arr.generate(function* () {
    if (!hasLabel(state.labels, PullRequestLabel.skipCi)) {
      yield 'hold' as const;
    }

    if (hasLabel(state.labels, PullRequestLabel.mergeQueued)) {
      yield 'dequeue' as const;
    }

    if (state.isArmed) {
      yield 'disarm' as const;
    }

    if (!state.isDraft) {
      yield 'draft' as const;
    }
  });

/**
 * What `done` has left to do to the pull request, or why it must not push:
 * one not held (`skip-ci` off, `merge-queued` on, or armed) would be pushed
 * into the merge. `record` is what `start` wrote down about taking
 * `merge-queued` off it, and `hasLayers` whether any layer is carried along.
 */
export const doneSteps = (
  state: ReworkState,
  handBack: ReworkHandBack,
  record: QueueRecord,
  hasLayers: boolean,
): Result<readonly ReworkStep[], string> => {
  const unsafe = Arr.generate(function* () {
    if (!hasLabel(state.labels, PullRequestLabel.skipCi)) {
      yield `${PullRequestLabel.skipCi} is off: run rework-pr start`;
    }

    if (hasLabel(state.labels, PullRequestLabel.mergeQueued)) {
      yield `${PullRequestLabel.mergeQueued} is on: if the author queued it again, ask them first; otherwise run rework-pr start`;
    }

    if (state.isArmed) {
      yield 'auto-merge is armed: run rework-pr start, or, where GraphQL is refused, ask the author to disarm it';
    }
  });

  if (Arr.isNonEmpty(unsafe)) {
    return Result.err(
      `a push now may go straight into the merge. ${unsafe.join('; ')}.`,
    );
  }

  return Result.ok(
    Arr.generate(function* () {
      yield 'push' as const;

      if (hasLayers) {
        yield 'restack' as const;
      }

      if (state.isDraft) {
        yield 'ready' as const;
      }

      // Last: a pull request queued is the worker's, and one it picks before
      // the push is pushed into the merge.
      if (record === 'untouched' && handBack === 'requeue') {
        yield 'requeue' as const;
      }

      if (record !== 'none') {
        yield 'forget' as const;
      }
    }),
  );
};

/** Why `done` must not push, given what `git status --porcelain` says. */
export const uncommittedRefusal = (porcelain: string): string | undefined =>
  porcelain.trim() === ''
    ? undefined
    : (`the working tree has uncommitted changes or untracked files; amend them into the commit, or remove them:\n${porcelain.trimEnd()}` as const);

/**
 * Whether the `merge-queued` event `recorded` — `start` taking the label off —
 * is still the last of `events`: put back on or taken off since by anyone, the
 * label is someone's later decision, and `done --requeue` leaves it alone.
 */
export const isUntouchedSince = (
  events: readonly QueueEvent[],
  recorded: number,
): boolean => {
  const last = Arr.last(events);

  return (
    Optional.isSome(last) &&
    last.value.event === 'unlabeled' &&
    last.value.id === recorded
  );
};

/**
 * What `done` does about `merge-queued`: puts it back (`requeue`) or leaves it
 * to the author (`review`).
 */
export type ReworkHandBack = 'requeue' | 'review';

/**
 * What `start` wrote down about taking `merge-queued` off a pull request:
 * nothing (`none`); the event of it, still the label's last (`untouched`); or
 * one the label has had events since (`moved`), which is someone's later
 * decision, and which `done --requeue` leaves alone.
 */
export type QueueRecord = 'moved' | 'none' | 'untouched';

/** An event that put `merge-queued` on a pull request or took it off. */
export type QueueEvent = Readonly<{
  id: number;
  event: 'labeled' | 'unlabeled';
}>;

/** The pull request as far as the steps need it. */
export type ReworkState = Readonly<{
  number: number;
  /** What the GraphQL mutations address it by. */
  nodeId: string;
  labels: readonly string[];
  isDraft: boolean;
  isArmed: boolean;
}>;

export type ReworkStep =
  | 'dequeue'
  | 'disarm'
  | 'draft'
  | 'forget'
  | 'hold'
  | 'push'
  | 'ready'
  | 'requeue'
  | 'restack';

/** What {@link decideReworkStanding} reads of a pull request's facts. */
export type ReworkFacts = StrictPick<PullRequestFacts, 'number'>;

/** What {@link decideReworkStanding} reads of a queue's decision. */
export type ReworkPullRequest<F extends ReworkFacts> = Readonly<
  StrictPick<PullRequestDecision, 'comments' | 'owner' | 'stackedOn'> & {
    facts: F;
  }
>;

/**
 * A pull request that may be reworked: its facts, the layers to carry along,
 * each after the one it is on, and the numbers of those left, a claim holding
 * on each or its comments unread.
 */
export type ReworkStanding<F extends ReworkFacts> = Readonly<{
  pr: F;
  layers: readonly F[];
  held: readonly number[];
}>;
