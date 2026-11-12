/**
 * What `open-pr` may do with what it observed (`spec/commands.md`, `open-pr`);
 * nothing that talks to GitHub.
 */

import { Arr, Result } from 'ts-data-forge';
import {
  isDeclarationLine,
  isMergesBeforeNote,
  isVersionBranch,
  mergesBeforeLine,
  outsideCodeFences,
  parseMergeAfter,
  PullRequestLabel,
} from '../conventions/index.mjs';
import { inheritStartAfter, NOTHING_UNREAD } from './graph.mjs';

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
export const mergeBeforeNote = mergesBeforeLine;

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
    .findIndex((line) => isDeclarationLine(line, 'merge-after'));

  const found = lines[at];

  if (found !== undefined) {
    return lines
      .with(at, `${found.trimEnd()}, ${numbers.map((n) => `#${n}`).join(', ')}`)
      .join('\n');
  }

  return body === '' ? `${trailer}\n` : `${trailer}\n\n${body}`;
};

/**
 * `body` with its `Merges before` line naming `numbers` (in that order): the
 * line there already, outside a fenced code block, rewritten, so that a second
 * run keeps one line; else one put after the first line when that is the
 * `Merge-After:` line, as a body `open-pr` wrote starts, or at the top.
 * Unchanged when it says that already, or `numbers` is empty. Written once
 * every pull request named has this one in its `Merge-After:`, so that a run
 * refused before then leaves no line saying so; which of those the line named
 * already still do is the caller's to have read (`parseMergesBefore`).
 */
export const withMergeBeforeNote = (
  body: string,
  numbers: readonly number[],
): string => {
  const note = mergeBeforeNote(numbers);

  if (note === undefined) {
    return body;
  }

  const lines = body.split('\n');

  // Blanked fences keep the line count, so an index found here is one in
  // `lines` too.
  const at = outsideCodeFences(body).split('\n').findIndex(isMergesBeforeNote);

  if (at !== -1) {
    return lines.with(at, note).join('\n');
  }

  const [first = '', ...rest] = lines;

  return isDeclarationLine(first, 'merge-after')
    ? [first, note, ...rest].join('\n')
    : body === ''
      ? `${note}\n`
      : `${note}\n\n${body}`;
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

/**
 * The pull request open for `branch`, from what lists the open pull requests of
 * it (at most two), or `undefined` for none. **Changed in v2**: two open (onto
 * different bases) are refused, where v1 took whichever GitHub listed first.
 */
export const ownPullRequest = <A extends Readonly<{ number: number }>>(
  branch: string,
  listed: readonly A[],
): Result<A | undefined, string> => {
  const [first, second] = listed;

  return second === undefined
    ? Result.ok(first)
    : Result.err(
        `${branch} is the branch of more than one open pull request (#${first?.number}, #${second.number}), so which one to open cannot be told; close the one not meant`,
      );
};

/**
 * The open pull request a new one onto `base` is stacked on, from the open pull
 * requests whose branch `base` is (at most two): exactly one. Anything else is
 * not a stack the queue would recognize, and is refused rather than opened.
 */
export const stackParent = (
  base: string,
  listed: readonly Readonly<{ number: number }>[],
): Result<number, string> => {
  const [parent, second] = listed;

  return parent === undefined
    ? Result.err(
        `${base} is neither the default branch nor the branch of an open pull request; a stacked pull request targets the branch of the one below it`,
      )
    : second === undefined
      ? Result.ok(parent.number)
      : Result.err(
          `${base} is the branch of more than one open pull request (#${parent.number}, #${second.number}), so which one this is stacked on cannot be told`,
        );
};

/**
 * Why `--merge-before #number` may not write into `successor`, or `undefined`
 * when it may: it is not open, or it is the version pull request, whose body
 * `changesets/action` rewrites on every push to the default branch, so that
 * `blocks-release` on this one is what holds the release.
 */
export const successorRefusal = (
  number: number,
  successor: Readonly<{ state: string; head: string }>,
  defaultBranch: string,
): string | undefined =>
  successor.state !== 'open'
    ? (`#${number} is ${successor.state}; --merge-before names an open pull request` as const)
    : isVersionBranch(successor.head, defaultBranch)
      ? (`#${number} is the version pull request, whose body is rewritten on every push; label this one ${PullRequestLabel.blocksRelease} instead` as const)
      : undefined;

/**
 * The open pull requests the issues pull request `number` closes start after
 * (`inheritStartAfter`), less what its body or `alsoDeclared` (the layer below,
 * `--merge-after`) says already: what `open-pr` writes into its `Merge-After:`.
 * The readers derive the same each time they read; this is the body saying it.
 */
export const missingInheritedOrder = (
  number: number,
  order: Readonly<{
    body: string;
    startAfterOf: ReadonlyMap<number, readonly number[]>;
    others: readonly Readonly<{ number: number; closes: readonly number[] }>[];
  }>,
  alsoDeclared: readonly number[],
): readonly number[] => {
  const inherited = inheritStartAfter({
    pulls: Arr.toUnshifted({
      number,
      closes: Array.from(order.startAfterOf.keys()),
    })(order.others),
    startAfterOf: order.startAfterOf,
    // Only which pull requests to wait for is asked, not what is not started.
    openIssues: new Set<number>(),
    // Each part was read, or the read failed as a whole.
    unread: NOTHING_UNREAD,
  });

  const declared = new Set(parseMergeAfter(order.body).concat(alsoDeclared));

  return (inherited.get(number)?.mergeAfter ?? []).filter(
    (each) => !declared.has(each),
  );
};
