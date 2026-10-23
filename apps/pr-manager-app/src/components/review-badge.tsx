import type { CodeOwnerReview } from 'pr-report-core';
import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{ review: Bindable<CodeOwnerReview> }>;

/**
 * Whether the pull request waits for a code owner to approve it.
 *
 * `main`'s ruleset asks for no approvals in general, but for a code owner's
 * on the paths `.github/CODEOWNERS` lists — so a pull request touching one
 * stays green and never merges, and nothing on it says why. Shown only when
 * that is the case, or when it cannot be told.
 */
export const ReviewBadge = ({ review }: Props): JSX.Element => (
  <If
    cond={mapBindable(
      review,
      ({ state }) => state === 'unknown' || state === 'required',
    )}
    then={
      <span
        class={constant('badge')}
        data-status={mapBindable(review, ({ state }) =>
          state === 'required' ? 'warning' : 'neutral',
        )}
        title={mapBindable(review, titleOf)}
      >
        <BadgeIcon path={constant(REVIEW_ICON)} />

        {mapBindable(review, labelOf)}
      </span>
    }
  />
);

const titleOf = (review: CodeOwnerReview): string =>
  review.state === 'required'
    ? [
        `${review.owners.map((owner) => `@${owner}`).join(', ')} to approve:`,
        ...review.paths.slice(0, MAX_LISTED_PATHS),
        ...(review.paths.length > MAX_LISTED_PATHS
          ? [`and ${review.paths.length - MAX_LISTED_PATHS} more`]
          : []),
        ...(review.authorOwns
          ? [
              'The author owns these paths and cannot approve their own pull request, so it merges only by a ruleset bypass.',
            ]
          : []),
      ].join('\n')
    : 'more files changed than this page reads, so it cannot tell whether a code owner has to approve';

const labelOf = (review: CodeOwnerReview): string =>
  review.state === 'required'
    ? review.authorOwns
      ? 'needs bypass'
      : 'awaiting code owner'
    : 'review unknown';

/** An eye. */
const REVIEW_ICON =
  'M1.8 8s2.3-4.2 6.2-4.2S14.2 8 14.2 8s-2.3 4.2-6.2 4.2S1.8 8 1.8 8zM6.4 8a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0';

/** Enough to say which paths without turning a tooltip into a file list. */
const MAX_LISTED_PATHS = 5;
