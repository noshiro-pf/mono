import {
  constant,
  mapBindable,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Entry, SetAsideView } from '../load-report.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{
  entry: Bindable<StrictPick<Entry, 'setAside' | 'baseRef'>>;
}>;

/**
 * That `unblock-prs` passed this pull request over, when it did. Why is in the
 * comment it left, whose prose the page does not read: the badge names the
 * reason, and its title where the comment is.
 *
 * Read from that comment rather than from GitHub's `mergeable`: the script
 * rebases, and whether a rebase goes through is its answer to give, not a merge
 * check's. Once the base has moved the next run tries again, so the badge stops
 * being a status and becomes a note.
 */
export const SetAsideBadge = ({ entry }: Props): JSX.Element => (
  <MatchOptional
    some={(shown$) => (
      <span
        class={constant('badge')}
        data-status={view(shown$, ({ setAside }) =>
          setAside.current ? 'critical' : 'neutral',
        )}
        title={view(shown$, titleOf)}
      >
        <BadgeIcon path={constant(SET_ASIDE_ICON)} />

        {view(shown$, ({ setAside: { current, reason } }) =>
          current
            ? `set aside: ${reason.replaceAll('-', ' ')}`
            : `was set aside: ${reason.replaceAll('-', ' ')}`,
        )}
      </span>
    )}
    value={mapBindable(entry, ({ setAside, baseRef }) =>
      setAside === undefined
        ? Optional.none
        : Optional.some({ setAside, baseRef }),
    )}
  />
);

const titleOf = ({
  setAside,
  baseRef,
}: Readonly<{ setAside: SetAsideView; baseRef: string }>): string =>
  [
    `unblock-prs set it aside (${setAside.reason}); its comment says why: ${setAside.url}`,
    setAside.current
      ? `Against ${baseRef} at ${setAside.baseSha.slice(0, 10)}, where it still is.`
      : `Against ${baseRef} at ${setAside.baseSha.slice(0, 10)}; ${baseRef} has moved since, so the next run tries again.`,
    ...(setAside.retry
      ? ['A retry was asked for on the comment; the next run tries again.']
      : []),
  ].join('\n');

/** An arrow that goes around rather than through. */
const SET_ASIDE_ICON = 'M3 12.5V9.5a4 4 0 0 1 4-4h6M10.5 3l2.5 2.5L10.5 8';
