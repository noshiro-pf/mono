import { type ChecksSummary } from 'pr-report-core';
import * as React from 'react';
import {
  describeCheckBreakdown,
  describeCheckCounts,
  presentVerdict,
} from '../verdict.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{ checks: ChecksSummary }>;

/**
 * The verdict of the contexts the ruleset requires, as an icon and a word,
 * and beside them how many are in each state — `1✗ 1… 7✓`.
 *
 * The counts because a verdict is one word over nine contexts, and the state
 * that once hid a failing pull request behind a tick — a required context
 * skipped in a round that was being superseded — is invisible unless the
 * parts are shown. The names are on hover.
 */
export const VerdictBadge = React.memo<Props>((props) => {
  const { checks } = props;

  const verdict = presentVerdict(checks.verdict);

  return (
    <span
      className={'badge'}
      data-status={verdict.status}
      title={describeCheckBreakdown(checks)}
    >
      <BadgeIcon path={verdict.icon} />

      {verdict.label}

      <span className={'badge-counts'}>{describeCheckCounts(checks)}</span>
    </span>
  );
});

VerdictBadge.displayName = 'VerdictBadge';
