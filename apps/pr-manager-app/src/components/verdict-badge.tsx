import { type PayloadChecks } from 'pr-report-payload';
import type * as React from 'react';
import { presentVerdict } from '../verdict.mjs';

type Props = Readonly<{ checks: PayloadChecks }>;

/** The verdict of the contexts the ruleset requires, as a glyph and a word. */
export const VerdictBadge = ({ checks }: Props): React.ReactElement => {
  const verdict = presentVerdict(checks.verdict);

  return (
    <span
      className={'badge'}
      data-status={verdict.status}
      title={`over the ${checks.required} contexts the ruleset requires`}
    >
      <span aria-hidden={'true'}>{verdict.glyph}</span>
      {verdict.label}
    </span>
  );
};
