import { type PayloadChecks } from 'pr-report-payload';
import type * as React from 'react';
import { presentVerdict } from '../verdict.mjs';

type Props = Readonly<{ checks: PayloadChecks }>;

/** The verdict of the contexts the ruleset requires, as an icon and a word. */
export const VerdictBadge = ({ checks }: Props): React.ReactElement => {
  const verdict = presentVerdict(checks.verdict);

  return (
    <span
      className={'badge'}
      data-status={verdict.status}
      title={`over the ${checks.required} contexts the ruleset requires`}
    >
      {/*
       * Inline rather than an `<img>`: it inherits `currentColor` from the
       * badge, so one drawing serves the four status colours and dark mode,
       * and the page's `img-src` never comes into it. `aria-hidden` because
       * the word beside it is the label.
       */}
      <svg
        aria-hidden={'true'}
        className={'badge-icon'}
        fill={'none'}
        focusable={'false'}
        stroke={'currentColor'}
        strokeLinecap={'round'}
        strokeLinejoin={'round'}
        strokeWidth={1.6}
        viewBox={'0 0 16 16'}
      >
        <path d={verdict.icon} />
      </svg>

      {verdict.label}
    </span>
  );
};
