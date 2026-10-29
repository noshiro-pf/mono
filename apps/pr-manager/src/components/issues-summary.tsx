import {
  constant,
  derive,
  If,
  mapBindable,
  view,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  isPriorityShown,
  PRIORITIES,
  PRIORITY_NAMES,
  type Priority,
} from '../priority.mjs';
import { issuesListStore, issuesViewStore } from '../store/index.mjs';
import { StatTile, StatToggle } from './stat-tile.js';

/**
 * What the open issues lead with, in either view: how many are shown of how
 * many are open, then the priorities, then `pending`, each a switch for the
 * issues it counts with an `only` switch in its corner — the merge order's
 * counts (`merge-order-filters.tsx`), for issues. What a switch does is
 * `issues-list-view.mts`, which keeps the choice in the URL; the list and the
 * DAG show the same issues.
 *
 * The priorities are joined into one control, since they are one question
 * asked of every issue, which has exactly one of them: picking two shows
 * either. `pending` stands apart, as the other question: picked with a
 * priority, it shows what is both (`issue-filter.mts`). Once a priority is
 * picked, the priorities neither picked nor hidden fade, and `pending` does
 * not, since it is not they that decide it.
 *
 * `open` is how many issues the view shown draws for their own sake — the
 * list, after its own switches and the search too (`countIssues`), or the
 * DAG (`issues-view-store.mts`), which also draws an issue left out that one
 * drawn waits on and does not count it. Each priority, and `pending`, is how
 * many of it showing it would draw. Beside each, in small, how many there
 * are in all when that is more. A priority is pressed while its issues are
 * shown: one neither hidden nor picked while another is picked is not, and
 * pressing it picks it too. `pending` is there while an open issue carries
 * it, or while it is switched off or picked, so that it can be undone.
 */
export const IssuesSummary = (): JSX.Element => {
  const counts$ = derive(
    [issuesViewStore.view, issuesListStore.counts, issuesViewStore.counts],
    (shown, list, dag) => (shown === 'dag' ? dag : list),
  );

  const view$ = issuesListStore.view;

  return (
    <div class={constant('issues-summary-box')}>
      <div
        aria-label={constant('Open issues by priority and pending')}
        class={constant('summary-row issues-summary')}
        role={constant('group')}
      >
        <StatTile
          label={'open'}
          total={mapBindable(counts$, ({ open }) => open.total)}
          value={mapBindable(counts$, ({ open }) => open.shown)}
        />
        <div
          aria-label={constant('Priority')}
          class={constant('stat-group')}
          data-picking={view(view$, ({ onlyPriorities }) =>
            Arr.isNonEmpty(onlyPriorities).toString(),
          )}
          role={constant('group')}
        >
          {PRIORITIES.map((priority) => (
            <StatToggle
              label={PRIORITY_NAMES[priority]}
              only={view(view$, ({ onlyPriorities }) =>
                onlyPriorities.includes(priority),
              )}
              pressed={view(view$, (filter) =>
                isPriorityShown(priority, filter),
              )}
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
          ))}
        </div>
        <If
          cond={derive(
            [counts$, view$],
            ({ pending }, { hidePending, onlyPending }) =>
              pending.total > 0 || hidePending || onlyPending,
          )}
          then={
            <StatToggle
              label={'pending'}
              only={view(view$, ({ onlyPending }) => onlyPending)}
              pickWith={'both'}
              pressed={view(view$, ({ hidePending }) => !hidePending)}
              subject={'what is labelled pending'}
              total={mapBindable(counts$, ({ pending }) => pending.total)}
              value={mapBindable(counts$, ({ pending }) => pending.shown)}
              onOnly={togglePendingOnly}
              onToggle={togglePending}
            />
          }
        />
      </div>
    </div>
  );
};

const PRIORITY_SUBJECTS = {
  high: 'the issues of high priority',
  mid: 'the issues of mid priority',
  low: 'the issues of low priority',
  none: 'the issues with no priority',
} as const satisfies ReadonlyRecord<Priority, string>;

const togglePending = (): void => {
  issuesListStore.togglePending();
};

const togglePendingOnly = (): void => {
  issuesListStore.togglePendingOnly();
};
