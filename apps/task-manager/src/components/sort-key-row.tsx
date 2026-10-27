import type { InitializedObservable } from 'synstate';
import { constant, derive, view, type Bindable, type JSX } from 'synstate-dom';
import type { SortSpec } from '../domain/index.mjs';
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
          aria-label={view(
            spec,
            (s) =>
              `${label(s)}の順序を切り替え（現在: ${sortOrderLabels[s.order]}）`,
          )}
          class={constant('bp6-button bp6-small')}
          type={constant('button')}
          onClick={() => {
            actions.toggleOrder(currentIndex());
          }}
        >
          {view(spec, (s) => (s.order === 'asc' ? '昇順 ↑' : '降順 ↓'))}
        </button>
        <button
          aria-label={view(spec, (s) => `${label(s)}を上へ`)}
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
          aria-label={view(spec, (s) => `${label(s)}を下へ`)}
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
          aria-label={view(spec, (s) => `${label(s)}を外す`)}
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
