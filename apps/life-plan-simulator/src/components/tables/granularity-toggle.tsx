import { SegmentedControl } from 'blueprint-synstate';
import type { InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { Granularity } from './result-table.js';

/** 表を年ごと / 月ごとに切り替えるボタン。 */
export const GranularityToggle = ({
  granularity$,
  setGranularity,
}: Readonly<{
  granularity$: InitializedObservable<Granularity>;
  setGranularity: (g: Granularity) => void;
}>): JSX.Element => (
  <SegmentedControl
    aria-label={constant('表示の単位')}
    intent={'primary'}
    size={'small'}
    options={options}
    value={granularity$}
    onValueChange={setGranularity}
  />
);

const options = [
  { value: 'year', label: '年ごと' },
  { value: 'month', label: '月ごと' },
] as const satisfies readonly Readonly<{ value: Granularity; label: string }>[];
