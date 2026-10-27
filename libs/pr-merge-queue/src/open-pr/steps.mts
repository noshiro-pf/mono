/** What the observed state allows, and nothing that talks to GitHub. */

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
 * `body` with `numbers` declared in it as well: added to the `Merge-After:`
 * line it opens with, which is where this command writes one, or in a line
 * of their own before it. The numbers are what the issues it closes start
 * after and the body does not yet say (`openPullRequest`).
 */
export const withInheritedMergeAfter = (
  body: string,
  numbers: readonly number[],
): string => {
  const trailer = mergeAfterTrailer(numbers);

  if (trailer === undefined) {
    return body;
  }

  const [first = '', ...rest] = body.split('\n');

  if (/^merge-after\s*:/iu.test(first)) {
    return Arr.toUnshifted(
      `${first.trimEnd()}, ${numbers.map((n) => `#${n}`).join(', ')}`,
    )(rest).join('\n');
  }

  return body === '' ? `${trailer}\n` : `${trailer}\n\n${body}`;
};
