import type { InitializedObservable } from 'synstate';
import { constant, derive, view, type Bindable, type JSX } from 'synstate-dom';
import type { SortSpec } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import {
  sortKeyLabels,
  sortOrderLabels,
  type SortKeyActions,
} from '../view-model/index.mjs';

type Props = Readonly<{
  spec: InitializedObservable<SortSpec>;
  index: InitializedObservable<number>;
  count: Bindable<number>;
  actions: SortKeyActions;
}>;

export const SortKeyRow = ({
  spec,
  index,
  count,
  actions,
}: Props): JSX.Element => {
  const currentIndex = (): number => index.getSnapshot().value;

  return (
    <li class={constant('sort-key-row')}>
      <span class={constant('sort-key-label')}>
        {derive([index, spec], (i, s) => `${i + 1}. ${label(s)}`)}
      </span>
      <span class={constant('sort-key-controls')}>
        <button
          aria-label={view(spec, (s) =>
            m.sort.toggleOrder(label(s), sortOrderLabels[s.order]),
          )}
          class={constant('bp6-button bp6-small')}
          type={constant('button')}
          onClick={() => {
            actions.toggleOrder(currentIndex());
          }}
        >
          {view(spec, (s) =>
            s.order === 'asc' ? m.sort.ascending : m.sort.descending,
          )}
        </button>
        <button
          aria-label={view(spec, (s) => m.sort.moveUp(label(s)))}
          class={constant('bp6-button bp6-small bp6-minimal')}
          disabled={view(index, (i) => i === 0)}
          type={constant('button')}
          onClick={() => {
            actions.moveKey(currentIndex(), -1);
          }}
        >
          {constant('▲')}
        </button>
        <button
          aria-label={view(spec, (s) => m.sort.moveDown(label(s)))}
          class={constant('bp6-button bp6-small bp6-minimal')}
          disabled={derive([index, count], (i, n) => i === n - 1)}
          type={constant('button')}
          onClick={() => {
            actions.moveKey(currentIndex(), 1);
          }}
        >
          {constant('▼')}
        </button>
        <button
          aria-label={view(spec, (s) => m.sort.remove(label(s)))}
          class={constant('bp6-button bp6-small bp6-minimal')}
          type={constant('button')}
          onClick={() => {
            actions.removeKey(currentIndex());
          }}
        >
          {constant('×')}
        </button>
      </span>
    </li>
  );
};

const label = (s: SortSpec): string => sortKeyLabels[s.key];
