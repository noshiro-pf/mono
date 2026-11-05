/** What the observed state allows, and nothing that talks to GitHub. */

import { outsideCodeFences, parseMergeAfter } from 'pr-report-core';
import { Arr } from 'ts-data-forge';

/**
 * The `Merge-After:` line for a chained pull request, or `undefined` when
 * nothing was declared. One line, in the order given, which is the form
 * `unblock-prs` reads.
 */
export const mergeAfterTrailer = (
  numbers: readonly number[],
): string | undefined =>
  Arr.isNonEmpty(numbers)
    ? (`Merge-After: ${numbers.map((n) => `#${n}`).join(', ')}` as const)
    : undefined;

/**
 * What to declare with `Merge-After:`: what was asked for, and — for a pull
 * request stacked on another — that one first. The base already says it, and
 * `unblock-prs` and the reports read the base alone; the trailer is written as
 * well so that the order is stated in the body like every other, and survives
 * the base being moved by hand.
 */
export const withStackParent = (
  mergeAfter: readonly number[],
  parent: number | undefined,
): readonly number[] =>
  parent === undefined
    ? mergeAfter
    : Arr.uniq(Arr.toUnshifted(parent)(mergeAfter));

/**
 * The line a pull request opened with `--merge-before` says it in, or
 * `undefined` when there is none. Prose, not a declaration: what holds the
 * order is the `Merge-After:` written into each of those, the one place a
 * reader of the pull request that waits looks for why it waits. This line is
 * the order stated where the work behind it is.
 */
export const mergeBeforeNote = (
  numbers: readonly number[],
): string | undefined =>
  Arr.isNonEmpty(numbers)
    ? (`Merges before ${numbers.map((n) => `#${n}`).join(', ')}, whose \`Merge-After:\` names this one.` as const)
    : undefined;

/**
 * `body` with `numbers` declared in it as well: added to its first
 * `Merge-After:` line outside a fenced code block, or in a line of their own at
 * the top when it has none. The numbers are what the issues it closes start
 * after and the body does not yet say, or the pull request just opened with
 * `--merge-before` this one (`openPullRequest`).
 */
export const withMergeAfter = (
  body: string,
  numbers: readonly number[],
): string => {
  const trailer = mergeAfterTrailer(numbers);

  if (trailer === undefined) {
    return body;
  }

  const lines = body.split('\n');

  // Blanked fences keep the line count, so an index found here is one in
  // `lines` too.
  const at = outsideCodeFences(body)
    .split('\n')
    .findIndex((line) => MERGE_AFTER_LINE.test(line));

  const found = lines[at];

  if (found !== undefined) {
    return lines
      .with(at, `${found.trimEnd()}, ${numbers.map((n) => `#${n}`).join(', ')}`)
      .join('\n');
  }

  return body === '' ? `${trailer}\n` : `${trailer}\n\n${body}`;
};

/**
 * Why a run cannot go on with the pull request already open for the branch, or
 * `undefined` when it can. Asked before anything is pushed.
 *
 * - A `--base` other than its base: a run that took it as it is would report it
 *   stacked while it still targets its old base, which is all `unblock-prs`
 *   reads. Moving it is refused rather than done: its diff, its `Merge-After:`
 *   and what it was reviewed against all change with the base, and which of
 *   them to keep is the author's call.
 * - Its own number in `--merge-after` or `--merge-before`: a pull request that
 *   waits for itself is never picked.
 */
export const existingConflict = (
  existing: Readonly<{ number: number; base: string }>,
  options: Readonly<{
    base: string | undefined;
    mergeAfter: readonly number[];
    mergeBefore: readonly number[];
  }>,
): string | undefined => {
  if (options.base !== undefined && existing.base !== options.base) {
    return `#${existing.number} is open against ${existing.base}, not ${options.base}, and open-pr does not move an open pull request. Change its base on GitHub and its Merge-After: to match, then run again; or run again with --base ${existing.base}.`;
  }

  const flag = options.mergeAfter.includes(existing.number)
    ? '--merge-after'
    : options.mergeBefore.includes(existing.number)
      ? '--merge-before'
      : undefined;

  return flag === undefined
    ? undefined
    : `${flag} #${existing.number} names the pull request already open for this branch`;
};

/**
 * The base a run targets: the one asked for, else that of the pull request
 * already open for the branch, so that a run finishing one opened stacked keeps
 * it stacked, else the default branch.
 */
export const resolveBase = (
  requested: string | undefined,
  existing: Readonly<{ base: string }> | undefined,
  defaultBranch: string,
): string => requested ?? existing?.base ?? defaultBranch;

/**
 * The numbers in `declared` that `body` does not declare with `Merge-After:`
 * yet, in the order given: what a run on a pull request opened earlier still
 * has to write into it, each once.
 */
export const undeclared = (
  body: string,
  declared: readonly number[],
): readonly number[] => {
  const named = new Set(parseMergeAfter(body));

  return Arr.uniq(declared.filter((n) => !named.has(n)));
};

/**
 * The first `--merge-before` number that `body` — this pull request's own, as
 * it stands once this run has written into it — declares with `Merge-After:`:
 * writing this one into that one's `Merge-After:` would have each wait on the
 * other. `undefined` when there is none.
 */
export const mergeBeforeCycle = (
  mergeBefore: readonly number[],
  body: string,
): number | undefined => {
  const named = new Set(parseMergeAfter(body));

  return mergeBefore.find((n) => named.has(n));
};

const MERGE_AFTER_LINE = /^\s*merge-after\s*:/iu;
