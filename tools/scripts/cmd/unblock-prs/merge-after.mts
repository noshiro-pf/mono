/**
 * What the declared order means for picking a pull request. Reading the
 * `Merge-After:` trailers, and finding the cycles in them, is `pr-report-core`,
 * because the Pull Requests Manager page reads the same declarations.
 */

import { Arr } from 'ts-data-forge';
import {
  type Classification,
  type PullRequest,
  type TriageContext,
} from './types.mjs';

/**
 * The pull requests this one declared it must merge after that have not
 * merged — or at least have not left the open list, which is the same thing
 * as far as an ordering is concerned.
 */
const waitingOn = (
  pr: PullRequest,
  context: TriageContext,
): readonly number[] =>
  (context.dependencies.get(pr.number) ?? []).filter((number) =>
    context.openNumbers.has(number),
  );

/**
 * The note to report instead of picking this pull request, if its declared
 * order says its turn has not come. Picking is all this constrains: a pull
 * request that is already up to date and merging is left to auto-merge, which
 * takes no notice of anything declared here.
 */
export const waitingOnNote = (
  pr: PullRequest,
  context: TriageContext,
): Classification | undefined => {
  const blockers = waitingOn(pr, context);

  if (!Arr.isNonEmpty(blockers)) return undefined;

  return {
    kind: 'note',
    note: `#${pr.number}: Merge-After ${blockers.map((number) => `#${number}`).join(', ')}, still open${
      context.cyclic.has(pr.number)
        ? ' — and on a Merge-After cycle, so nothing here will move it'
        : ''
    }`,
  };
};
