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
import { isPriorityShown, ISSUE_TIERS, type IssueTier } from '../priority.mjs';
import { issuesListStore, issuesViewStore } from '../store/index.mjs';
import { StatTile, StatToggle } from './stat-tile.js';

/**
 * What the open issues lead with, in either view: how many are shown of how
 * many are open, then the priorities, then `pending` and `in progress`, each a
 * switch for the issues it counts with an `only` switch in its corner — the
 * merge order's counts (`merge-order-filters.tsx`), for issues. What a switch
 * does is `issues-list-view.mts`, which keeps the choice in the URL; the list
 * and the
 * DAG show the same issues.
 *
 * The priorities are joined into one control, since they are one question asked
 * of every issue, which has exactly one of them: picking two shows either.
 * `pending` and `in progress` stand apart, as other questions:
 * picked with a priority, each shows what is both (`issue-filter.mts`). Once a
 * priority is picked, the priorities neither picked nor hidden fade, and
 * `pending` and `in progress` do not, since it is not they that decide them.
 *
 * `open` is how many issues the view shown draws for their own sake — the list,
 * after its own switches and the search too (`countIssues`), or the
 * DAG (`issues-view-store.mts`), which also draws an issue left out that one
 * drawn waits on and does not count it. Each priority, and `pending`, is how
 * many of it showing it would draw, and so is `in progress`. Beside each, in
 * small, how many there are in all when that is more. A priority is pressed
 * while its issues are shown: one neither hidden nor picked while another is
 * picked is not, and pressing it picks it too. `pending` is there while an open
 * issue carries it, and `in progress` while an open issue is under way, or
 * while either is switched off or picked, so that it can be undone.
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
        aria-label={constant(
          'Open issues by priority, pending and in progress',
        )}
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
          {ISSUE_TIERS.map((priority) => (
            <StatToggle
              label={priority}
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
        <If
          cond={derive(
            [counts$, view$],
            ({ inProgress }, { hideInProgress, onlyInProgress }) =>
              inProgress.total > 0 || hideInProgress || onlyInProgress,
          )}
          then={
            <StatToggle
              label={'in progress'}
              only={view(view$, ({ onlyInProgress }) => onlyInProgress)}
              pickWith={'both'}
              pressed={view(view$, ({ hideInProgress }) => !hideInProgress)}
              subject={
                'the issues in progress: those that can start, and that an open pull request closes or that are labelled in-progress'
              }
              total={mapBindable(counts$, ({ inProgress }) => inProgress.total)}
              value={mapBindable(counts$, ({ inProgress }) => inProgress.shown)}
              onOnly={toggleInProgressOnly}
              onToggle={toggleInProgress}
            />
          }
        />
      </div>
    </div>
  );
};

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

const togglePending = (): void => {
  issuesListStore.togglePending();
};

const togglePendingOnly = (): void => {
  issuesListStore.togglePendingOnly();
};

const toggleInProgress = (): void => {
  issuesListStore.toggleInProgress();
};

const toggleInProgressOnly = (): void => {
  issuesListStore.toggleInProgressOnly();
};
