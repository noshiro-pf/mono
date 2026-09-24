import * as React from 'react';
import { type Mergeability } from '../load-report.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{ mergeability: Mergeability; baseRef: string }>;

/**
 * Shown only when the branch conflicts with its base.
 *
 * This is the pull request `unblock-prs` sets aside: its rebase stops on the
 * conflict, and nothing but a person resolving it will move the pull request
 * again. That used to be said only on the terminal the script ran in; GitHub
 * knows it too, and this is GitHub's answer.
 *
 * Nothing is shown for `mergeable`, which is the ordinary case, or for
 * `unknown`, which is GitHub still working it out after a push.
 */
export const ConflictBadge = React.memo<Props>(({ mergeability, baseRef }) =>
  mergeability === 'conflicting' ? (
    <span
      className={'badge'}
      data-status={'critical'}
      title={`conflicts with ${baseRef}: a rebase stops here until the conflict is resolved by hand`}
    >
      <BadgeIcon path={CONFLICT_ICON} />

      {'conflicts with base'}
    </span>
  ) : undefined,
);

ConflictBadge.displayName = 'ConflictBadge';

/** Two branches running into each other. */
const CONFLICT_ICON = 'M4 2.8v3.4l4 3.4v3.6M12 2.8v3.4L8 9.6M6.2 13.2h3.6';
