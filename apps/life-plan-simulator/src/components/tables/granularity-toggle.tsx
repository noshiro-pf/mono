import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import type { Granularity } from './result-table.js';

/** 表を年ごと / 月ごとに切り替えるボタン。 */
export const GranularityToggle = ({
  granularity$,
  setGranularity,
}: Readonly<{
  granularity$: InitializedObservable<Granularity>;
  setGranularity: (g: Granularity) => void;
}>): JSX.Element => (
  <div
    class={constant('toggle')}
    role={constant('group')}
    aria-label={constant('表示の単位')}
  >
    {options.map(({ id, label }) => (
      <button
        type={constant('button')}
        aria-pressed={view(granularity$, (g) => (g === id ? 'true' : 'false'))}
        onClick={() => {
          setGranularity(id);
        }}
      >
        {constant(label)}
      </button>
    ))}
  </div>
);

const options = [
  { id: 'year', label: '年ごと' },
  { id: 'month', label: '月ごと' },
] as const satisfies readonly Readonly<{ id: Granularity; label: string }>[];
