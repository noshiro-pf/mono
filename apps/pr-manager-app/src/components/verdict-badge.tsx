import type { ChecksSummary } from 'pr-report-core';
import {
  constant,
  derive,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { reader } from '../store/index.mjs';
import {
  describeCheckBreakdown,
  describeCheckCounts,
  presentVerdict,
  type StatusRole,
} from '../verdict.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{
  /** `undefined` while the check results are still being read. */
  checks: Bindable<ChecksSummary | undefined>;
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
export const VerdictBadge = ({ checks }: Props): JSX.Element => {
  const shown = derive([checks, reader.features], (summary, { ruleset }) =>
    presentChecks(summary, ruleset),
  );

  return (
    <span
      class={constant('badge')}
      data-status={mapBindable(shown, ({ status }) => status)}
      title={mapBindable(shown, ({ title }) => title)}
    >
      <BadgeIcon path={mapBindable(shown, ({ icon }) => icon)} />

      {mapBindable(shown, ({ label }) => label)}

      <If
        cond={mapBindable(checks, (summary) => summary !== undefined)}
        then={
          <span class={constant('badge-counts')}>
            {mapBindable(shown, ({ counts }) => counts)}
          </span>
        }
      />
    </span>
  );
};

type Shown = Readonly<{
  status: StatusRole;
  icon: string;
  label: string;
  title: string;
  counts: string;
}>;

const presentChecks = (
  checks: ChecksSummary | undefined,
  rulesetDeclared: boolean,
): Shown => {
  if (checks === undefined) {
    return {
      status: 'neutral',
      icon: presentVerdict('pending').icon,
      label: 'reading checks…',
      title: 'The check results have not been read yet.',
      counts: '',
    };
  }

  const verdict = presentVerdict(checks.verdict);

  return {
    status: verdict.status,
    icon: verdict.icon,
    label: verdict.label,
    title: describeCheckBreakdown(checks, rulesetDeclared),
    counts: describeCheckCounts(checks),
  };
};
