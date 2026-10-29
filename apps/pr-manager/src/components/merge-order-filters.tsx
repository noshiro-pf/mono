import {
  constant,
  derive,
  For,
  mapBindable,
  view,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  STATUS_NAMES,
  statusFiltersOf,
  type Count,
  type MergeOrderSort,
  type StatusFilter,
} from '../merge-order-view.mjs';
import { PRIORITIES, type Priority } from '../priority.mjs';
import { mergeOrderStore, reader } from '../store/index.mjs';
import type { StatusRole } from '../verdict.mjs';
import { OfTotal, StatTile, StatToggle } from './stat-tile.js';

/**
 * What the merge order leads with: the counts, each a switch for the pull
 * requests it counts with an `only` switch in its corner, then the
 * priorities, which are switches too, and the order. What a switch does is `merge-order-view.mts`, which keeps the
 * choice in the URL.
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
 * owner` where no ruleset asks for one (`statusFiltersOf`).
 */
export const MergeOrderFilters = (): JSX.Element => {
  const { view: view$, counts: counts$ } = mergeOrderStore;

  return (
    <div class={constant('merge-order-filters')}>
      <div
        class={constant('summary-row')}
        data-picking={view(view$, ({ onlyStatuses }) =>
          Arr.isNonEmpty(onlyStatuses).toString(),
        )}
      >
        <StatTile
          label={'open'}
          total={view(counts$, ({ open }) => open.total)}
          value={view(counts$, ({ open }) => open.shown)}
        />
        <For
          items={view(reader.features, statusFiltersOf)}
          key={(filter) => filter}
        >
          {(filter$) => {
            // Read once: the tiles are keyed by it.
            const filter = filter$.getSnapshot().value;

            // Not known while what it is counted from is still being read.
            const count = derive(
              [reader.summary, counts$],
              (summary, counts): Count | undefined =>
                summary[filter] === undefined
                  ? undefined
                  : counts.statuses[filter],
            );

            return (
              <StatToggle
                label={STATUS_NAMES[filter]}
                only={view(view$, ({ onlyStatuses }) =>
                  onlyStatuses.includes(filter),
                )}
                pressed={view(
                  view$,
                  ({ hiddenStatuses }) => !hiddenStatuses.includes(filter),
                )}
                tone={mapBindable(count, (c) =>
                  (c?.shown ?? 0) > 0 ? STATUS_TONES[filter] : undefined,
                )}
                total={mapBindable(count, (c) => c?.total)}
                value={mapBindable(count, (c) => c?.shown)}
                onOnly={() => {
                  mergeOrderStore.toggleOnly(filter);
                }}
                onToggle={() => {
                  mergeOrderStore.toggleStatus(filter);
                }}
              />
            );
          }}
        </For>
      </div>

      <div class={constant('merge-order-controls')}>
        <fieldset
          aria-label={constant('Priority')}
          class={constant('filter-group')}
        >
          <span class={constant('filter-group-name')}>
            {constant('priority')}
          </span>
          {PRIORITIES.map((priority) => (
            <button
              aria-pressed={view(view$, ({ hiddenPriorities }) =>
                (!hiddenPriorities.includes(priority)).toString(),
              )}
              class={constant('filter-chip')}
              type={constant('button')}
              onClick={() => {
                mergeOrderStore.togglePriority(priority);
              }}
            >
              {constant(PRIORITY_NAMES[priority])}
              <span class={constant('filter-chip-count')}>
                {view(counts$, ({ priorities }) => priorities[priority].shown)}
                <OfTotal
                  count={view(
                    counts$,
                    ({ priorities }) => priorities[priority],
                  )}
                />
              </span>
            </button>
          ))}
        </fieldset>

        <fieldset
          aria-label={constant('Sort')}
          class={constant('theme-switch')}
        >
          <button
            aria-pressed={view(view$, ({ sort }) =>
              (sort === 'order').toString(),
            )}
            class={constant('theme-switch-option')}
            title={constant(
              'In the order the trailers and the stacks declare.',
            )}
            type={constant('button')}
            onClick={sortByOrder}
          >
            {constant('merge order')}
          </button>
          <button
            aria-pressed={view(view$, ({ sort }) =>
              (sort === 'priority').toString(),
            )}
            class={constant('theme-switch-option')}
            title={constant(
              'Each level of the tree by the highest priority in it and below it; no priority is between mid and low.',
            )}
            type={constant('button')}
            onClick={sortByPriority}
          >
            {constant('priority')}
          </button>
        </fieldset>
      </div>
    </div>
  );
};

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

const sortBy = (sort: MergeOrderSort) => (): void => {
  mergeOrderStore.setSort(sort);
};

const sortByOrder = sortBy('order');

const sortByPriority = sortBy('priority');
