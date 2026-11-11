/**
 * What `push-fixed-pr` does with a pull request a session fixed
 * (`spec/commands.md`, `push-fixed-pr`): push the fix leased against the head
 * the claim was made at and carry the layers above along, or refuse, and why.
 */

import { Arr, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import {
  hasLabel,
  PullRequestLabel,
  type PullRequestClaim,
} from '../conventions/index.mjs';
import type { PullRequestFacts, Read } from '../snapshot/index.mjs';
import { holdingClaim, notSkillsReason } from './claim-pr.mjs';
import type { PullRequestDecision } from './queue.mjs';
import type { QueueComments } from './set-aside.mjs';
import { layerHold, layersAbove } from './stack.mjs';

/**
 * Whether `by` may push `head` to pull request `number` of the queue read
 * (`pullRequests`), and what that involves: only one a skill owns, whose claim
 * holds and is `by`'s, not a fork's, and not one of `generated` set aside
 * `rebase-failed` (its conflict is resolved by its `rebuild`). The layers above
 * are carried along, but for one a claim holds on, `by`'s own included.
 */
export const decidePushFixedPr = <F extends PushFixedPrFacts>(
  pullRequests: readonly PushFixedPrPullRequest<F>[],
  ask: Readonly<{
    number: number;
    by: string;
    head: string;
    generated: readonly GeneratedBranch[];
  }>,
): PushFixedPrDecision<F> => {
  const { number, by, head } = ask;

  const pr = pullRequests.find(
    (candidate) => candidate.facts.number === number,
  );

  if (pr === undefined) {
    return { kind: 'refuse', reason: 'it is not open' };
  }

  const { owner, comments, facts } = pr;

  const notSkills = notSkillsReason(owner);

  if (notSkills !== undefined) {
    return { kind: 'refuse', reason: notSkills };
  }

  if (holdingClaimOf(comments)?.by !== by) {
    return {
      kind: 'refuse',
      reason: `${by} holds no claim on it at its head; claim it first (claim-pr)`,
    };
  }

  if (head === facts.headSha) {
    return { kind: 'refuse', reason: `${head} is already its head` };
  }

  if (facts.fromFork) {
    return { kind: 'refuse', reason: 'its branch is in a fork' };
  }

  const generatedAs = ask.generated.find(
    ({ branch }) => branch === facts.headRef,
  );

  const setAside = Result.isOk(comments) ? comments.value.setAside : undefined;

  // A generated branch, lockfile and all: its conflict is resolved by building
  // it again from the tip, not by a rebase resolved by hand.
  if (
    generatedAs !== undefined &&
    setAside?.says.kind === 'standing' &&
    setAside.says.record.reason === 'rebase-failed'
  ) {
    return {
      kind: 'refuse',
      reason: `${generatedAs.branch} is generated, so a conflict on it is resolved by building it again: ${generatedAs.rebuild}`,
    };
  }

  // Any claim holding above, `by`'s own included, and one not known of.
  const layers = layersAbove(pullRequests, number).map(
    (layer) => [layer.facts, layerHold(layer.comments)] as const,
  );

  return {
    kind: 'push',
    pr: facts,
    addSkipCi: !hasLabel(
      facts.labels.map(({ name }) => name),
      PullRequestLabel.skipCi,
    ),
    layers: Arr.generate(function* () {
      for (const [layer, hold] of layers) {
        if (hold.kind === 'free') {
          yield layer;
        }
      }
    }),
    claimed: Arr.generate(function* () {
      for (const [layer, hold] of layers) {
        if (hold.kind === 'claimed') {
          yield { layer, by: hold.by };
        }
      }
    }),
    unread: Arr.generate(function* () {
      for (const [layer, hold] of layers) {
        if (hold.kind === 'unread') {
          yield layer;
        }
      }
    }),
  };
};

/** A branch the repository builds rather than writes. */
export type GeneratedBranch = Readonly<{ branch: string; rebuild: string }>;

/** What {@link decidePushFixedPr} reads of a pull request's facts. */
export type PushFixedPrFacts = StrictPick<
  PullRequestFacts,
  'fromFork' | 'headRef' | 'headSha' | 'labels' | 'number'
>;

/** What {@link decidePushFixedPr} reads of a queue's decision. */
export type PushFixedPrPullRequest<F extends PushFixedPrFacts> = Readonly<
  StrictPick<PullRequestDecision, 'comments' | 'owner' | 'stackedOn'> & {
    facts: F;
  }
>;

export type PushFixedPrDecision<F extends PushFixedPrFacts> = Readonly<
  | {
      kind: 'push';
      pr: F;
      /** Whether `skip-ci` goes on first, so that the push runs no matrix. */
      addSkipCi: boolean;
      /** The layers carried along, each after the one it is on. */
      layers: readonly F[];
      /** The layers left, a claim holding on each, and whose it is. */
      claimed: readonly Readonly<{ layer: F; by: string }>[];
      /** The layers left, their comments unread, so a claim on each unknown. */
      unread: readonly F[];
    }
  | { kind: 'refuse'; reason: string }
>;

const holdingClaimOf = (
  comments: Read<QueueComments>,
): PullRequestClaim | undefined =>
  Result.isOk(comments) ? holdingClaim(comments.value.claim) : undefined;
