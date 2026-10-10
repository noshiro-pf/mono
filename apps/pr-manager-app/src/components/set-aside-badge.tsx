import { memoNamed } from 'preact-utils';
import type { SetAsideView } from '../load-report.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{ setAside: SetAsideView | undefined; baseRef: string }>;

/**
 * That `unblock-prs` passed this pull request over, when it did. Why is in
 * the comment it left, whose prose the page does not read: the badge names
 * the reason, and its title where the comment is.
 *
 * Read from that comment rather than from GitHub's `mergeable`: the script
 * rebases, and whether a rebase goes through is its answer to give, not a
 * merge check's. Once the base has moved the next run tries again, so the
 * badge stops being a status and becomes a note.
 */
export const SetAsideBadge = memoNamed<Props>('SetAsideBadge', (props) => {
  const { setAside, baseRef } = props;

  if (setAside === undefined) {
    return undefined;
  }

  const reason = setAside.reason.replaceAll('-', ' ');

  return (
    <span
      className={'badge'}
      data-status={setAside.current ? 'critical' : 'neutral'}
      title={[
        `unblock-prs set it aside (${setAside.reason}); its comment says why: ${setAside.url}`,
        setAside.current
          ? `Against ${baseRef} at ${setAside.baseSha.slice(0, 10)}, where it still is.`
          : `Against ${baseRef} at ${setAside.baseSha.slice(0, 10)}; ${baseRef} has moved since, so the next run tries again.`,
        ...(setAside.retry
          ? ['A retry was asked for on the comment; the next run tries again.']
          : []),
      ].join('\n')}
    >
      <BadgeIcon path={SET_ASIDE_ICON} />

      {setAside.current ? `set aside: ${reason}` : `was set aside: ${reason}`}
    </span>
  );
});

/** An arrow that goes around rather than through. */
const SET_ASIDE_ICON = 'M3 12.5V9.5a4 4 0 0 1 4-4h6M10.5 3l2.5 2.5L10.5 8';
