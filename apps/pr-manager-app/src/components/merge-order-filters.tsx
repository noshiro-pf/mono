import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Arr, Obj } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  STATUS_FILTERS,
  STATUS_NAMES,
  statusFiltersOf,
  type MergeOrderSort,
  type StatusFilter,
} from '../merge-order-view.mjs';
import { PRIORITIES, type Priority } from '../priority.mjs';
import {
  mergeOrderSignals,
  mergeOrderStore,
  readerSignals,
} from '../store/index.mjs';
import type { StatusRole } from '../verdict.mjs';
import { OfTotal, StatTile } from './stat-tile.js';

/**
 * What the merge order leads with: the counts, each a switch for the pull
 * requests it counts with an `only` switch in its corner, then the
 * priorities, which are switches too, and the order. What a switch does is `merge-order-view.mts`; the choice is kept
 * across visits (`settings-db.mts`).
 *
 * Each number is what the list below shows (`countView` in
 * `merge-order-view.mts`), and, when the switches leave some of them out,
 * how many there are in all beside it in small: the list is what a reader
 * counts against, and the whole is still a glance away. `open` is the one
 * count that is not a switch: hiding every open pull request is not a view
 * of them. The first three counts are `pr-report-core`'s, the same
 * `pnpm run pr-report` leads with, less its `draft` and `behind`, which are
 * not drawn: a draft is always shown, and its card's badge says so, and how
 * far behind the base a pull request is is its card's ahead / behind bar.
 * `set aside` and `awaiting code owner` are what stops a pull request that
 * is otherwise ready, and are only this page's, as is `pending`, the
 * `pending` label an author puts on what they are holding back, which is
 * the count to switch off to leave it out. `queued` and `set aside` are
 * left out where the repository does not run the queue, and `awaiting code
 * owner` where it declares no ruleset (`statusFiltersOf`).
 */
export const MergeOrderFilters = memoNamed('MergeOrderFilters', () => {
  const summary = readerSignals.summary.value;

  const view = mergeOrderSignals.view.value;

  const counts = mergeOrderSignals.counts.value;

  const features = readerSignals.features.value;

  const filters = useMemo(() => statusFiltersOf(features), [features]);

  return (
    <div className={'merge-order-filters'}>
      <div
        className={'summary-row'}
        data-picking={Arr.isNonEmpty(view.onlyStatuses)}
      >
        <StatTile
          label={'open'}
          total={counts.open.total}
          value={counts.open.shown}
        />
        {filters.map((filter) => {
          // Not known while what it is counted from is still being read.
          const count =
            summary[filter] === undefined ? undefined : counts.statuses[filter];

          return (
            <StatTile
              key={filter}
              label={STATUS_NAMES[filter]}
              only={view.onlyStatuses.includes(filter)}
              pressed={!view.hiddenStatuses.includes(filter)}
              tone={(count?.shown ?? 0) > 0 ? STATUS_TONES[filter] : undefined}
              total={count?.total}
              value={count?.shown}
              onOnly={toggleOnly[filter]}
              onToggle={toggleStatus[filter]}
            />
          );
        })}
      </div>

      <div className={'merge-order-controls'}>
        <fieldset aria-label={'Priority'} className={'filter-group'}>
          <span className={'filter-group-name'}>{'priority'}</span>
          {PRIORITIES.map((priority) => (
            <button
              key={priority}
              aria-pressed={!view.hiddenPriorities.includes(priority)}
              className={'filter-chip'}
              type={'button'}
              onClick={togglePriority[priority]}
            >
              {PRIORITY_NAMES[priority]}
              <span className={'filter-chip-count'}>
                {counts.priorities[priority].shown}
                <OfTotal
                  shown={counts.priorities[priority].shown}
                  total={counts.priorities[priority].total}
                />
              </span>
            </button>
          ))}
        </fieldset>

        <fieldset aria-label={'Sort'} className={'theme-switch'}>
          <button
            aria-pressed={view.sort === 'order'}
            className={'theme-switch-option'}
            title={'In the order the trailers and the stacks declare.'}
            type={'button'}
            onClick={sortByOrder}
          >
            {'merge order'}
          </button>
          <button
            aria-pressed={view.sort === 'priority'}
            className={'theme-switch-option'}
            title={
              'Each level of the tree by the highest priority in it and below it; no priority is between mid and low.'
            }
            type={'button'}
            onClick={sortByPriority}
          >
            {'priority'}
          </button>
        </fieldset>
      </div>
    </div>
  );
});

// Outside the component, so that each switch is handed the same function on
// every render.

const STATUS_TONES = {
  queued: undefined,
  failing: 'critical',
  setAside: 'critical',
  awaitingReview: 'warning',
  pending: undefined,
} as const satisfies ReadonlyRecord<StatusFilter, StatusRole | undefined>;

const PRIORITY_NAMES = {
  high: 'high',
  mid: 'mid',
  low: 'low',
  none: 'none',
} as const satisfies ReadonlyRecord<Priority, string>;

const toggleStatus = Obj.fromEntries(
  STATUS_FILTERS.map(
    (filter) =>
      [
        filter,
        () => {
          mergeOrderStore.toggleStatus(filter);
        },
      ] as const,
  ),
);

const toggleOnly = Obj.fromEntries(
  STATUS_FILTERS.map(
    (filter) =>
      [
        filter,
        () => {
          mergeOrderStore.toggleOnly(filter);
        },
      ] as const,
  ),
);

const togglePriority = Obj.fromEntries(
  PRIORITIES.map(
    (priority) =>
      [
        priority,
        () => {
          mergeOrderStore.togglePriority(priority);
        },
      ] as const,
  ),
);

const sortBy = (sort: MergeOrderSort) => (): void => {
  mergeOrderStore.setSort(sort);
};

const sortByOrder = sortBy('order');

const sortByPriority = sortBy('priority');
