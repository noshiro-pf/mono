/** What the observed state allows, and nothing that talks to GitHub. */

import { outsideCodeFences } from 'pr-report-core';
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
 * `unblock-prs` and the reports read the base alone; the trailer is written
 * as well so that the order is stated in the body like every other, and
 * survives the base being moved by hand.
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
 * `Merge-After:` line outside a fenced code block, or in a line of their own
 * at the top when it has none. The numbers are what the issues it closes
 * start after and the body does not yet say, or the pull request just opened
 * with `--merge-before` this one (`openPullRequest`).
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

const MERGE_AFTER_LINE = /^\s*merge-after\s*:/iu;
