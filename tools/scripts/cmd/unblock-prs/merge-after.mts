/**
 * What the declared order means for picking a pull request, as a note.
 * Reading the `Merge-After:` trailers, finding the cycles in them and
 * deciding that a pull request waits is `pr-report-core`'s, because the Pull
 * Requests Manager page draws the same queue.
 */

import type { Classification, PullRequest } from './types.mjs';

/**
 * The note to report instead of picking this pull request while what it
 * must merge after is still open. Picking is all this constrains: a pull
 * request that is already up to date and merging is left to auto-merge,
 * which takes no notice of anything declared here.
 */
export const waitingOnNote = (
  pr: PullRequest,
  on: readonly number[],
  cyclic: boolean,
): Classification =>
  ({
    kind: 'note',
    note: `#${pr.number}: Merge-After ${on.map((number) => `#${number}`).join(', ')}, still open${
      cyclic
        ? ' — and on a Merge-After cycle, so nothing here will move it'
        : ''
    }`,
  }) as const;
