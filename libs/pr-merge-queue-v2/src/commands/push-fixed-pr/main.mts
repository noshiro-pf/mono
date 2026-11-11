/**
 * `push-fixed-pr` (`spec/commands.md`): hands a fixed pull request back to the
 * worker. Pushes the commit a session made onto the branch it claimed, under
 * `skip-ci`, leased against the head the claim was made at, and carries the
 * layers stacked on it along with the worker's own restack, so that a session's
 * push is the push the worker would have made. The push moves the head, which
 * ends the claim and resolves the set-aside: the pull request is the worker's
 * again.
 */

import {
  decidePushFixedPr,
  PullRequestLabel,
  type PullRequestFacts,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { Config } from '../../config/index.mjs';
import { restackLines, type RestackOutcome } from '../../git/index.mjs';
import {
  addLabel,
  openSession,
  type SessionWorld,
} from '../../github/index.mjs';
import { readQueue } from '../pr-report/index.mjs';
import type { PushFixedPrOptions } from './options.mjs';

export const pushFixedPr = async (
  { number, by, head }: PushFixedPrOptions,
  world: PushFixedPrWorld,
): Promise<Result<string, string>> => {
  const commit = await world.git.resolveCommit(head);

  if (commit === undefined) {
    return Result.err(`${head} is not a commit here.`);
  }

  const [session, config] = await Promise.all([
    openSession(undefined, world),
    world.readConfig(),
  ]);

  if (Result.isErr(session)) {
    return session;
  }

  if (Result.isErr(config)) {
    return config;
  }

  const { context } = session.value;

  const queue = await readQueue(context, world.nowEpochMs());

  if (Result.isErr(queue)) {
    return Result.err(`cannot read the queue: ${queue.value}`);
  }

  const decided = decidePushFixedPr(queue.value.pullRequests, {
    number,
    by,
    head: commit,
    generated: config.value?.generatedBranches ?? [],
  });

  if (decided.kind === 'refuse') {
    return Result.err(`#${number} not pushed: ${decided.reason}.`);
  }

  const { pr } = decided;

  if (decided.addSkipCi) {
    const added = await addLabel(context, number, PullRequestLabel.skipCi);

    if (Result.isErr(added)) {
      return Result.err(
        `#${number} not pushed: cannot put ${PullRequestLabel.skipCi} on it first, and without it the push runs the matrix: ${added.value}`,
      );
    }
  }

  const pushed = await world.git.pushLeased({
    branch: pr.headRef,
    sha: commit,
    lease: pr.headSha,
  });

  if (Result.isErr(pushed)) {
    return Result.err(`#${number}: the push failed: ${pushed.value}`);
  }

  if (pushed.value === 'moved') {
    return Result.err(
      `#${number}: someone pushed to ${pr.headRef} since it was claimed; throw the work away and survey again.`,
    );
  }

  const outcomes = await world.git.restack(
    { branch: pr.headRef, from: pr.headSha, to: commit },
    decided.layers,
  );

  const movedTo = movedHeads(pr, commit, decided.layers, outcomes);

  // Each branch of the stack by name, as read: this repository's, so no fork's.
  // By name because that is what stacks a layer (its base is the head of the
  // one below), and from the facts and outcomes restack was given and returned,
  // its contract, rather than from its bookkeeping.
  const stack = new Map<string, PullRequestFacts>(
    [
      pr,
      ...decided.layers,
      ...decided.claimed.map(({ layer }) => layer),
      ...decided.unread,
    ]
      .filter(({ fromFork }) => !fromFork)
      .map((facts) => [facts.headRef, facts] as const),
  );

  const ownClaims = new Set<number>(
    decided.claimed
      .filter(({ by: claimant }) => claimant === by)
      .map(({ layer }) => layer.number),
  );

  const lines = [
    ...decided.claimed.map(({ layer, by: claimant }) => {
      if (claimant !== by) {
        return `#${layer.number}: not restacked — ${claimant} claimed it.`;
      }

      const below = stack.get(layer.baseRef);

      return ownClaimLine(layer, by, {
        moved: movedTo.get(layer.baseRef),
        readAt: below?.headSha,
        own: below !== undefined && ownClaims.has(below.number),
        left: outcomes.find(
          (outcome) =>
            outcome.kind === 'left' && outcome.number === below?.number,
        ),
        defaultBranch: session.value.defaultBranch,
      });
    }),
    ...decided.unread.map(
      ({ number: above }) =>
        `#${above}: not restacked — its comments could not be read, so whether someone claimed it is not known.`,
    ),
    ...restackLines(outcomes),
  ] as const;

  // Pushed is pushed: a layer left is said, not an exit of 1, which would read
  // as the fix not having landed. A layer left on the old head shows its
  // conflict on GitHub, and is its owner's to restack, as in v1.
  return Result.ok(
    Arr.toUnshifted(
      `#${number}: pushed ${commit.slice(0, 10)} under ${PullRequestLabel.skipCi}; it is the worker's again.`,
    )(lines).join('\n'),
  );
};

/**
 * Where each branch the push moved went, by name: the pull request's own, and
 * each layer restacked.
 */
const movedHeads = (
  pr: PullRequestFacts,
  commit: string,
  layers: readonly PullRequestFacts[],
  outcomes: readonly RestackOutcome[],
): ReadonlyMap<string, Readonly<{ from: string; to: string }>> =>
  new Map<string, Readonly<{ from: string; to: string }>>(
    Arr.toUnshifted([pr.headRef, { from: pr.headSha, to: commit }] as const)(
      Arr.generate(function* () {
        for (const outcome of outcomes) {
          if (outcome.kind !== 'restacked') {
            continue;
          }

          const layer = layers.find(({ number }) => number === outcome.number);

          if (layer !== undefined) {
            yield [
              layer.headRef,
              { from: layer.headSha, to: outcome.head },
            ] as const;
          }
        }
      }),
    ),
  );

/**
 * A layer `by`'s own claim holds on, which is left for `by` to move before
 * pushing its fix, by a rebase of the claimed head (detached: the fix is pushed
 * by `push-fixed-pr --head`, not from a local branch) from the head the layer
 * below had. When this push moved that one, the rebase is exact. When that one
 * is `by`'s own too, the push of its fix moves it and prints this one's exact
 * rebase. Otherwise (it was left, someone else claimed it, or someone else
 * moved it) where it will be is not this push's to know (rebased, or merged and
 * gone), so the target is a placeholder: in capitals, which a shell takes as a
 * revision git refuses, not as a redirection. The head below as read is always
 * found for a stacked layer, and a placeholder too should it not be.
 */
const ownClaimLine = (
  layer: PullRequestFacts,
  by: string,
  below: Readonly<{
    moved: Readonly<{ from: string; to: string }> | undefined;
    readAt: string | undefined;
    own: boolean;
    left: RestackOutcome | undefined;
    defaultBranch: string;
  }>,
): string => {
  const left =
    `#${layer.number}: not restacked — ${by}'s own claim holds on it` as const;

  if (below.moved !== undefined) {
    return `${left}; move it before fixing it: git rebase --onto ${below.moved.to} ${below.moved.from} ${layer.headSha}`;
  }

  if (below.own) {
    return `${left}, and on ${layer.baseRef}, which ${by}'s claim holds too; pushing that one's fix prints this one's exact rebase.`;
  }

  const why =
    below.left?.kind === 'left'
      ? (` (not restacked: ${below.left.reason})` as const)
      : '';

  return `${left}, and this push did not move the layer it is on, ${layer.baseRef}${why}; before pushing a fix, move it onto where that is by then (${below.defaultBranch}, once it has merged): git rebase --onto TARGET ${below.readAt ?? 'BELOW'} ${layer.headSha}`;
};

/** What `push-fixed-pr` reads and writes the world through. */
export type PushFixedPrWorld = SessionWorld &
  Readonly<{
    nowEpochMs: () => number;
    /** The repository's `.github/unblock-prs.json`, as the clone has it. */
    readConfig: () => Promise<Result<Config | undefined, string>>;
    git: PushGit;
  }>;

/**
 * The git a push needs, run in this clone against its `origin` (`git/`): the
 * commit a revision names, the leased push, and the restack.
 */
export type PushGit = Readonly<{
  /** The commit `revision` names in this clone, whole; `undefined` for none. */
  resolveCommit: (revision: string) => Promise<string | undefined>;
  pushLeased: (
    push: Readonly<{ branch: string; sha: string; lease: string }>,
  ) => Promise<Result<'moved' | 'pushed', string>>;
  restack: (
    moved: Readonly<{ branch: string; from: string; to: string }>,
    layers: readonly PullRequestFacts[],
  ) => Promise<readonly RestackOutcome[]>;
}>;
