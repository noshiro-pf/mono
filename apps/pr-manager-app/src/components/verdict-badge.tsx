import { type ChecksSummary } from 'pr-report-core';
import * as React from 'react';
import { presentVerdict } from '../verdict.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{ checks: ChecksSummary }>;

/** The verdict of the contexts the ruleset requires, as an icon and a word. */
export const VerdictBadge = React.memo<Props>((props) => {
  const { checks } = props;

  const verdict = presentVerdict(checks.verdict);

  return (
    <span
      className={'badge'}
      data-status={verdict.status}
      title={`over the ${checks.required} contexts the ruleset requires`}
    >
      <BadgeIcon path={verdict.icon} />

      {verdict.label}
    </span>
  );
});

VerdictBadge.displayName = 'VerdictBadge';
