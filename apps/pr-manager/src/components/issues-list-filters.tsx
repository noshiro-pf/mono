import type { InitializedObservable } from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  ISSUE_STARTS,
  type IssueSort,
  type LabelCount,
} from '../issues-list-view.mjs';
import { chipColors } from '../label-color.mjs';
import { issuesListStore } from '../store/index.mjs';
import { explainState, stateLabels } from './issue-dag-states.mjs';
import { OfTotal } from './stat-tile.js';

/**
 * What the list of open issues leads with: a search of the titles, matched as
 * it is typed whatever the case, and not kept in the URL; the start states,
 * switches as the merge order's priorities are (`merge-order-filters.tsx`), in
 * the DAG's words; the labels, each a pick; and the order. What each does is
 * `issues-list-view.mts`, which keeps the choice in the URL.
 *
 * Each number is how many of what it counts the list shows, followed in
 * small by how many there are when that is more — the merge order's
 * counts, for issues. The priorities and `pending` are above these, with the
 * counts (`issues-summary.tsx`), since the DAG reads them too.
 */
export const IssuesListFilters = (): JSX.Element => {
  const { view: view$, counts: counts$ } = issuesListStore;

  return (
    <div class={constant('issues-list-controls')}>
      <input
        aria-label={constant('Search issue titles')}
        autocomplete={constant('off')}
        class={constant('issues-search')}
        placeholder={constant('Search titles')}
        type={constant('search')}
        value={issuesListStore.query}
        onInput={(typed) => {
          issuesListStore.setQuery(typed.currentTarget.value);
        }}
      />

      <fieldset
        aria-label={constant('Start state')}
        class={constant('filter-group')}
      >
        <span class={constant('filter-group-name')}>{constant('start')}</span>
        {ISSUE_STARTS.map((start) => (
          <button
            aria-pressed={view(view$, ({ hiddenStarts }) =>
              (!hiddenStarts.includes(start)).toString(),
            )}
            class={constant('filter-chip')}
            title={constant(
              start === 'in-progress'
                ? 'an open pull request closes it, or it is labelled in-progress.'
                : explainState({ kind: 'issue', state: start, marked: 'none' }),
            )}
            type={constant('button')}
            onClick={() => {
              issuesListStore.toggleStart(start);
            }}
          >
            {constant(stateLabels[start])}
            <span class={constant('filter-chip-count')}>
              {view(counts$, ({ starts }) => starts[start].shown)}
              <OfTotal count={view(counts$, ({ starts }) => starts[start])} />
            </span>
          </button>
        ))}
      </fieldset>

      <If
        cond={view(counts$, ({ labels }) => Arr.isNonEmpty(labels))}
        then={
          <fieldset
            aria-label={constant('Labels')}
            class={constant('filter-group')}
          >
            <span class={constant('filter-group-name')}>
              {constant('label')}
            </span>
            <For
              items={view(counts$, ({ labels }) => labels)}
              key={(label) => label.name}
            >
              {(label$) => <LabelPick label$={label$} />}
            </For>
          </fieldset>
        }
      />

      <fieldset aria-label={constant('Sort')} class={constant('theme-switch')}>
        <button
          aria-pressed={view(view$, ({ sort }) =>
            (sort === 'updated').toString(),
          )}
          class={constant('theme-switch-option')}
          title={constant('The most recently updated first.')}
          type={constant('button')}
          onClick={sortByUpdate}
        >
          {constant('updated')}
        </button>
        <button
          aria-pressed={view(view$, ({ sort }) =>
            (sort === 'priority').toString(),
          )}
          class={constant('theme-switch-option')}
          title={constant(
            'High first; no priority is between mid and low. The most recently updated first within each.',
          )}
          type={constant('button')}
          onClick={sortByPriority}
        >
          {constant('priority')}
        </button>
        <button
          aria-pressed={view(view$, ({ sort }) =>
            (sort === 'start').toString(),
          )}
          class={constant('theme-switch-option')}
          title={constant(
            'What can be started first, then what is in progress, what needs a look, what waits, and what is on a cycle. The most recently updated first within each.',
          )}
          type={constant('button')}
          onClick={sortByStart}
        >
          {constant('start')}
        </button>
      </fieldset>
    </div>
  );
};

/**
 * One label: its name beside a dot of GitHub's colour for it, and how many
 * open issues carry it. Pressed (`aria-pressed`) is picked, which is drawn
 * in the accent, as the merge order's `only` is: a label not picked is not
 * hidden, and is not struck through as a switched-off priority is.
 *
 * A row keyed by the label's name, so the name is the one it was made with.
 */
const LabelPick = ({
  label$,
}: Readonly<{ label$: InitializedObservable<LabelCount> }>): JSX.Element => {
  const labelName = label$.getSnapshot().value.name;

  return (
    <button
      aria-pressed={view(label$, ({ picked }) => picked.toString())}
      class={constant('filter-chip label-pick')}
      title={view(label$, ({ picked }) =>
        picked
          ? `Picked. Click to stop showing only the issues labelled ${labelName}.`
          : `Click to show only the issues labelled ${labelName}, and any others picked.`,
      )}
      type={constant('button')}
      onClick={() => {
        issuesListStore.toggleLabel(labelName);
      }}
    >
      <If
        cond={view(label$, ({ color }) => color !== undefined)}
        then={
          <span
            aria-hidden={constant('true')}
            class={constant('label-pick-dot')}
            style={{
              'background-color': view(label$, ({ color }) =>
                color === undefined ? undefined : chipColors(color).background,
              ),
            }}
          />
        }
      />
      {constant(labelName)}
      <span class={constant('filter-chip-count')}>
        {view(label$, ({ count }) => count.shown)}
        <OfTotal count={view(label$, ({ count }) => count)} />
      </span>
    </button>
  );
};

const sortBy = (sort: IssueSort) => (): void => {
  issuesListStore.setSort(sort);
};

const sortByUpdate = sortBy('updated');

const sortByPriority = sortBy('priority');

const sortByStart = sortBy('start');
