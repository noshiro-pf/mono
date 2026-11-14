import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import {
  START_NAMES,
  START_SWITCHES,
  type IssuesSettings,
  type IssuesSort,
} from '../../../domain/index.mjs';
import type { IssuesBlockView, IssuesStore } from '../../../store/index.mjs';
import { IssueListRow } from './issue-list-row.js';

type Ready = IssuesBlockView & Readonly<{ kind: 'ready' }>;

type Props = Readonly<{
  view: InitializedObservable<Ready>;
  store: IssuesStore;
  now: InitializedObservable<number>;
}>;

/**
 * The issues as a list (spec §11.2): a search box, the labels to pick, the
 * start states to switch, the sort, then a row per issue.
 */
export const IssueList = ({ view, store, now }: Props): JSX.Element => (
  <div class={constant('issue-list')}>
    <div class={constant('controls')}>
      <input
        aria-label={constant('Search the titles, or a number')}
        class={constant('search')}
        placeholder={constant('Search titles or #number')}
        type={constant('search')}
        value={store.query}
        onInput={(event) => {
          store.setQuery(event.currentTarget.value);
        }}
      />

      <fieldset class={constant('control-group')}>
        <legend>{constant('start')}</legend>
        {START_SWITCHES.map((start) => (
          <button
            aria-pressed={store.settings.pipe(
              map(({ hideStart }) => !hideStart.includes(start)),
            )}
            class={constant('chip')}
            data-start={constant(start)}
            type={constant('button')}
            onClick={() => {
              store.update((prev) => ({
                ...prev,
                hideStart: prev.hideStart.includes(start)
                  ? prev.hideStart.filter((s) => s !== start)
                  : Arr.toPushed(prev.hideStart, start),
              }));
            }}
          >
            {constant(START_NAMES[start])}
          </button>
        ))}
      </fieldset>

      <fieldset class={constant('control-group')}>
        <legend>{constant('sort')}</legend>
        {SORTS.map(([sort, name]) => (
          <button
            aria-pressed={store.settings.pipe(map((s) => s.sort === sort))}
            class={constant('chip')}
            type={constant('button')}
            onClick={() => {
              store.update((prev) => ({ ...prev, sort }));
            }}
          >
            {constant(name)}
          </button>
        ))}
      </fieldset>
    </div>

    <If
      cond={view.pipe(map(({ labelNames }) => Arr.isNonEmpty(labelNames)))}
      then={
        <fieldset class={constant('control-group label-picks')}>
          <legend>{constant('labels')}</legend>
          <For
            items={view.pipe(map(({ labelNames }) => labelNames))}
            key={(n) => n}
          >
            {(name$) => (
              <button
                aria-pressed={isPicked(store.settings, name$)}
                class={constant('chip')}
                title={constant(
                  'Once any label is picked, only the issues carrying one picked are listed.',
                )}
                type={constant('button')}
                onClick={() => {
                  const name = Optional.unwrap(name$.getSnapshot());

                  store.update((prev) => ({
                    ...prev,
                    labels: (prev.labels.includes(name)
                      ? prev.labels.filter((l) => l !== name)
                      : Arr.toPushed(prev.labels, name)
                    ).toSorted((a, b) => a.localeCompare(b)),
                  }));
                }}
              >
                {name$}
              </button>
            )}
          </For>
        </fieldset>
      }
    />

    <If
      cond={view.pipe(map(({ listed }) => Arr.isEmpty(listed)))}
      then={
        <p class={constant('muted')}>
          {constant('The filters leave nothing to show.')}
        </p>
      }
    />

    <ul class={constant('rows')}>
      <For
        items={view.pipe(map(({ listed }) => listed))}
        key={({ number }) => number}
      >
        {(row$) => <IssueListRow now={now} row={row$} />}
      </For>
    </ul>
  </div>
);

const isPicked = (
  settings: InitializedObservable<IssuesSettings>,
  name$: InitializedObservable<string>,
): InitializedObservable<boolean> =>
  settings.pipe(
    map(({ labels }) => labels.includes(Optional.unwrap(name$.getSnapshot()))),
  );

const SORTS = [
  ['updated', 'updated'],
  ['priority', 'priority'],
  ['start', 'start'],
] as const satisfies readonly (readonly [IssuesSort, string])[];
