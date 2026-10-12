import { memoNamed } from 'preact-utils';
import { Arr, Obj } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  isPressed,
  PRIORITIES,
  STATUS_FILTERS,
  STATUS_NAMES,
  type MergeOrderSort,
  type Priority,
  type StatusFilter,
  type StatusMode,
} from '../merge-order-view.mjs';
import {
  mergeOrderSignals,
  mergeOrderStore,
  readerSignals,
} from '../store/index.mjs';
import type { StatusRole } from '../verdict.mjs';
import { StatTile } from './stat-tile.js';

/**
 * What the merge order leads with: whether pressing a count hides what it
 * counts or shows only that, the counts, each a switch for the pull
 * requests it counts, then the priorities, which are switches too, and the
 * order. What a switch does is `merge-order-view.mts`; the choice is kept
 * across visits (`settings-db.mts`).
 *
 * `open` is the one count that is not a switch: hiding every open pull
 * request is not a view of them. The first five counts are
 * `pr-report-core`'s, the same `pnpm run pr-report` leads with; `set aside`
 * and `awaiting code owner` are what stops a pull request that is otherwise
 * ready, and are only this page's.
 */
export const MergeOrderFilters = memoNamed('MergeOrderFilters', () => {
  const summary = readerSignals.summary.value;

  const view = mergeOrderSignals.view.value;

  const shown = mergeOrderSignals.shown.value;

  const priorities = mergeOrderSignals.priorities.value;

  return (
    <div className={'merge-order-filters'}>
      <div className={'status-mode'}>
        <span className={'filter-group-name'}>{'click a count to'}</span>
        <fieldset aria-label={'Status mode'} className={'theme-switch'}>
          <button
            aria-pressed={view.statusMode === 'hide'}
            className={'theme-switch-option'}
            title={'Clicking a count hides the pull requests it counts.'}
            type={'button'}
            onClick={hideByStatus}
          >
            {'hide it'}
          </button>
          <button
            aria-pressed={view.statusMode === 'only'}
            className={'theme-switch-option'}
            title={
              'Clicking a count picks it, and only the pull requests under a picked count are shown.'
            }
            type={'button'}
            onClick={showOnlyByStatus}
          >
            {'show only it'}
          </button>
        </fieldset>
      </div>

      <div
        className={'summary-row'}
        data-picking={
          view.statusMode === 'only' && Arr.isNonEmpty(view.onlyStatuses)
        }
      >
        <StatTile label={'open'} value={summary.open} />
        {STATUS_FILTERS.map((filter) => (
          <StatTile
            key={filter}
            label={STATUS_NAMES[filter]}
            mode={view.statusMode}
            pressed={isPressed(view, filter)}
            tone={(summary[filter] ?? 0) > 0 ? STATUS_TONES[filter] : undefined}
            value={summary[filter]}
            onToggle={pressStatus[filter]}
          />
        ))}
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
                {priorities[priority]}
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

        {shown < summary.open ? (
          <span className={'filter-shown'}>
            {`showing ${shown} of ${summary.open}`}
          </span>
        ) : undefined}
      </div>
    </div>
  );
});

// Outside the component, so that each switch is handed the same function on
// every render.

const STATUS_TONES = {
  queued: undefined,
  draft: undefined,
  failing: 'critical',
  behind: undefined,
  setAside: 'critical',
  awaitingReview: 'warning',
} as const satisfies ReadonlyRecord<StatusFilter, StatusRole | undefined>;

const PRIORITY_NAMES = {
  high: 'high',
  mid: 'mid',
  low: 'low',
  none: 'none',
} as const satisfies ReadonlyRecord<Priority, string>;

const pressStatus = Obj.fromEntries(
  STATUS_FILTERS.map(
    (filter) =>
      [
        filter,
        () => {
          mergeOrderStore.pressStatus(filter);
        },
      ] as const,
  ),
);

const statusModeTo = (statusMode: StatusMode) => (): void => {
  mergeOrderStore.setStatusMode(statusMode);
};

const hideByStatus = statusModeTo('hide');

const showOnlyByStatus = statusModeTo('only');

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
