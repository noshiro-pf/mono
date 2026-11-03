import {
  constant,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { IssueFilterCounts } from '../issues-list-view.mjs';
import { isPriorityShown, ISSUE_TIERS, type IssueTier } from '../priority.mjs';
import { issuesListStore } from '../store/index.mjs';
import { StatToggle } from './stat-tile.js';

type Props = Readonly<{
  row: TierRow;
  /** The counts of the view shown, the list's or the DAG's. */
  counts$: Bindable<IssueFilterCounts>;
}>;

/**
 * The issue tiers of one {@link TIER_ROWS} row, joined edge to edge, for
 * `issues-summary.tsx`. Both rows are the one control: picking in either fades
 * the tiers of both that are neither picked nor hidden, and each group's name
 * says it is the priority.
 */
export const IssueTierGroup = ({ row, counts$ }: Props): JSX.Element => {
  const view$ = issuesListStore.view;

  return (
    <div
      aria-label={constant(GROUP_NAMES[row])}
      class={constant(`stat-group tiers-${row}`)}
      data-picking={view(view$, ({ onlyPriorities }) =>
        Arr.isNonEmpty(onlyPriorities).toString(),
      )}
      role={constant('group')}
    >
      {ISSUE_TIERS.filter((priority) => TIER_ROWS[priority] === row).map(
        (priority) => (
          <StatToggle
            description={TIER_MEANINGS[priority]}
            label={priority}
            only={view(view$, ({ onlyPriorities }) =>
              onlyPriorities.includes(priority),
            )}
            pressed={view(view$, (filter) => isPriorityShown(priority, filter))}
            subject={PRIORITY_SUBJECTS[priority]}
            total={mapBindable(
              counts$,
              ({ priorities }) => priorities[priority].total,
            )}
            value={mapBindable(
              counts$,
              ({ priorities }) => priorities[priority].shown,
            )}
            onOnly={() => {
              issuesListStore.togglePriorityOnly(priority);
            }}
            onToggle={() => {
              issuesListStore.togglePriority(priority);
            }}
          />
        ),
      )}
    </div>
  );
};

type TierRow = 'ranked' | 'aside';

/**
 * Where each tier's switch is drawn: the tiers that rank what to start, and
 * `none`, which `run-issue-resolver` ranks among them, on a row of their own;
 * `hold` and `close`, which say not to start an issue at all, beside `open` and
 * `in progress`. How many each row holds is also in `index.css`
 * (`--tier-columns` and the corners of `.tiers-ranked`).
 */
const TIER_ROWS = {
  S: 'ranked',
  A: 'ranked',
  B: 'ranked',
  C: 'ranked',
  D: 'ranked',
  hold: 'aside',
  close: 'aside',
  none: 'ranked',
} as const satisfies ReadonlyRecord<IssueTier, TierRow>;

/**
 * What each tier means, as a tile's tooltip says it: the list on
 * `pr-report-core`'s `ISSUE_PRIORITIES`, which follows
 * `docs/issue-priority.md`'s table; a change there is a change here.
 */
const TIER_MEANINGS = {
  S: 'Priority S: speeds up the work on everything else now: CI, check-changed, the merge queue, the review loop, a step a person does by hand most days.',
  A: 'Priority A: what the rest of that stands on, a step a person does by hand on every release or deploy, a security issue, or a bug real users meet that stops what they came to do.',
  B: 'Priority B: the other bugs in an app with users or in a published package, and smaller gains in speed.',
  C: 'Priority C: documents, refactoring, small improvements and features.',
  D: 'Priority D: an app nobody uses but its author, and large features.',
  hold: 'Hold: not to be started as things stand: code about to be replaced, or work waiting on a decision.',
  close: 'Close: to be closed or folded into another issue at the next triage.',
  none: 'No priority: the issue has no priority label, or more than one.',
} as const satisfies ReadonlyRecord<IssueTier, string>;

/** Each group's name, as a screen reader reads it. */
const GROUP_NAMES = {
  ranked: 'Priority: S to D, or none',
  aside: 'Priority: hold or close',
} as const satisfies ReadonlyRecord<TierRow, string>;

/** What each tier's switch counts (`docs/issue-priority.md`). */
const PRIORITY_SUBJECTS = {
  S: 'the issues of priority S',
  A: 'the issues of priority A',
  B: 'the issues of priority B',
  C: 'the issues of priority C',
  D: 'the issues of priority D',
  hold: 'the issues on hold',
  close: 'the issues to close or merge',
  none: 'the issues placed under no priority, or under several',
} as const satisfies ReadonlyRecord<IssueTier, string>;
