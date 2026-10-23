import type { ChecksSummary } from 'pr-report-core';
import { memoNamed } from 'preact-utils';
import { readerSignals } from '../store/index.mjs';
import {
  describeCheckBreakdown,
  describeCheckCounts,
  presentVerdict,
} from '../verdict.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{
  /** `undefined` while the check results are still being read. */
  checks: ChecksSummary | undefined;
}>;

/**
 * The verdict of the contexts the ruleset requires — or, where none is
 * declared, of every context reported on the head — as an icon and a word,
 * and beside them how many are in each state — `1✗ 1… 7✓`.
 *
 * The counts because a verdict is one word over nine contexts, and the state
 * that once hid a failing pull request behind a tick — a required context
 * skipped in a round that was being superseded — is invisible unless the
 * parts are shown. The names are on hover.
 */
export const VerdictBadge = memoNamed<Props>('VerdictBadge', (props) => {
  const { checks } = props;

  if (checks === undefined) {
    return (
      <span
        className={'badge'}
        data-status={'neutral'}
        title={'The check results have not been read yet.'}
      >
        <BadgeIcon path={presentVerdict('pending').icon} />

        {'reading checks…'}
      </span>
    );
  }

  const verdict = presentVerdict(checks.verdict);

  const { ruleset } = readerSignals.features.value;

  return (
    <span
      className={'badge'}
      data-status={verdict.status}
      title={describeCheckBreakdown(checks, ruleset)}
    >
      <BadgeIcon path={verdict.icon} />

      {verdict.label}

      <span className={'badge-counts'}>{describeCheckCounts(checks)}</span>
    </span>
  );
});
