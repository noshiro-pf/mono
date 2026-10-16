import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Arr, Obj } from 'ts-data-forge';
import type { IssueSort, LabelCount } from '../issues-list-view.mjs';
import { chipColors } from '../label-color.mjs';
import { PRIORITIES } from '../priority.mjs';
import { issuesListSignals, issuesListStore } from '../store/index.mjs';
import { OfTotal } from './stat-tile.js';

/**
 * What the list of open issues leads with: the priorities, switches as the
 * merge order's are (`merge-order-filters.tsx`); the labels, each a pick;
 * and the order. What each does is `issues-list-view.mts`; the choice is
 * kept across visits (`settings-db.mts`).
 *
 * Each number is how many of what it counts the list shows, followed in
 * small by how many there are when that is more — the merge order's
 * counts, for issues.
 */
export const IssuesListFilters = memoNamed('IssuesListFilters', () => {
  const view = issuesListSignals.view.value;

  const counts = issuesListSignals.counts.value;

  return (
    <div className={'issues-list-controls'}>
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
            {priority}
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

      {Arr.isEmpty(counts.labels) ? undefined : (
        <fieldset aria-label={'Labels'} className={'filter-group'}>
          <span className={'filter-group-name'}>{'label'}</span>
          {counts.labels.map((label) => (
            <LabelPick key={label.name} label={label} />
          ))}
        </fieldset>
      )}

      <fieldset aria-label={'Sort'} className={'theme-switch'}>
        <button
          aria-pressed={view.sort === 'updated'}
          className={'theme-switch-option'}
          title={'The most recently updated first.'}
          type={'button'}
          onClick={sortByUpdate}
        >
          {'updated'}
        </button>
        <button
          aria-pressed={view.sort === 'priority'}
          className={'theme-switch-option'}
          title={
            'High first; no priority is between mid and low. The most recently updated first within each.'
          }
          type={'button'}
          onClick={sortByPriority}
        >
          {'priority'}
        </button>
      </fieldset>
    </div>
  );
});

/**
 * One label: its name beside a dot of GitHub's colour for it, and how many
 * open issues carry it. Pressed (`aria-pressed`) is picked, which is drawn
 * in the accent, as the merge order's `only` is: a label not picked is not
 * hidden, and is not struck through as a switched-off priority is.
 */
const LabelPick = memoNamed<Readonly<{ label: LabelCount }>>(
  'LabelPick',
  ({ label: { name: labelName, color, picked, count } }) => {
    const dot = useMemo(
      () =>
        color === undefined
          ? undefined
          : { backgroundColor: chipColors(color).background },
      [color],
    );

    const toggle = useMemo(
      () => () => {
        issuesListStore.toggleLabel(labelName);
      },
      [labelName],
    );

    return (
      <button
        aria-pressed={picked}
        className={'filter-chip label-pick'}
        title={
          picked
            ? `Picked. Click to stop showing only the issues labelled ${labelName}.`
            : `Click to show only the issues labelled ${labelName}, and any others picked.`
        }
        type={'button'}
        onClick={toggle}
      >
        {dot === undefined ? undefined : (
          <span aria-hidden className={'label-pick-dot'} style={dot} />
        )}
        {labelName}
        <span className={'filter-chip-count'}>
          {count.shown}
          <OfTotal shown={count.shown} total={count.total} />
        </span>
      </button>
    );
  },
);

// Outside the component, so that each switch is handed the same function on
// every render.

const togglePriority = Obj.fromEntries(
  PRIORITIES.map(
    (priority) =>
      [
        priority,
        () => {
          issuesListStore.togglePriority(priority);
        },
      ] as const,
  ),
);

const sortBy = (sort: IssueSort) => (): void => {
  issuesListStore.setSort(sort);
};

const sortByUpdate = sortBy('updated');

const sortByPriority = sortBy('priority');
