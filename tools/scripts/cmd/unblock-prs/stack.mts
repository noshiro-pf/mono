// cspell:ignore retarget retargeted

/**
 * Stacked pull requests: one whose base is another open pull request's
 * branch rather than the default branch. Which pull request is on which is
 * `pr-report-core`'s `stack.mts`, because the reports draw the same stacks;
 * what this script does about them is decided here.
 *
 * The life of a layer, and what this script does at each point:
 *
 * 1. **Stacked.** Its base is the layer below, so its diff is its own and its
 *    turn has not come: it is reported as waiting, and nothing else. It has
 *    no auto-merge, and must not: nothing holds a pull request onto an
 *    unprotected branch, so armed it would land in the layer below rather
 *    than on the default branch. Nothing arms it — `open-pr` arms nothing,
 *    and this script arms a pull request only when it picks it
 *    (`auto-merge.mts`), which a stacked one never is.
 * 2. **The layer below moves.** When this script rebases a pull request, it
 *    replays every layer stacked on it onto the new head with
 *    `git rebase --onto <new head> <old head>`, which carries exactly the
 *    layer's own commits. Otherwise each layer would show the old commits of
 *    the one below in its diff, and GitHub's own rebase, when that one
 *    merges, would start from a head the layer does not contain.
 * 3. **The layer below merges.** GitHub moves this one onto the default
 *    branch (and, with native stacks, rebases it there). From then on it is
 *    an ordinary pull request, picked and armed in its turn like any other,
 *    save one thing only its timeline remembers: if GitHub did not rebase
 *    it, it still carries the merged layer's commits, which the rebase drops
 *    with `--onto` rather than trusting the patches to match.
 */

import {
  type Classification,
  type PullRequest,
  type TimelineEvent,
  type TriageContext,
} from './types.mjs';
import { isSafeRefName } from './util.mjs';

/**
 * The branch the pull request was stacked on, if the last change of its base
 * moved it off that branch and onto the default one.
 */
export const retargetedFrom = (
  events: readonly TimelineEvent[],
  defaultBranch: string,
): string | undefined => {
  const last = events.findLast((event) => event.kind === 'base-changed');

  return last?.kind === 'base-changed' &&
    last.to === defaultBranch &&
    last.from !== defaultBranch
    ? last.from
    : undefined;
};

/** What to report for a stacked pull request in place of anything else. */
export const stackedNote = (
  pr: PullRequest,
  parent: number,
  context: TriageContext,
): Classification =>
  ({
    kind: 'note',
    note: `#${pr.number}: stacked on #${parent}, which merges first${
      context.cyclic.has(pr.number)
        ? ' — and on a cycle of stacks and Merge-After, so nothing here will move it'
        : ''
    }`,
  }) as const;

/**
 * Why a layer cannot be carried along when the one below it moves, or
 * `undefined` when it can. A fork's branch is not this repository's to push
 * to, whatever its name.
 */
export const restackable = (pr: PullRequest): string | undefined =>
  pr.state !== 'OPEN'
    ? (`it is ${pr.state}` as const)
    : pr.isCrossRepository
      ? 'its branch is in a fork'
      : !isSafeRefName(pr.headRefName)
        ? (`branch name ${JSON.stringify(pr.headRefName)} will not be passed to a shell` as const)
        : undefined;
