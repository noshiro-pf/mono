import { memoNamed } from 'react-utils';
import { type SafeUint } from 'ts-type-forge';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { DetailedFilterNumIcon } from './detailed-filter-num-icon.js';

type Props = Readonly<{
  enabled: boolean;
  min: SafeUint;
  max: SafeUint;
  upperLimit: SafeUint;
}>;

export const DetailedFilterNumFairPlusPoorIcon = memoNamed<Props>(
  'DetailedFilterNumFairPlusPoorIcon',
  ({ enabled, min, max, upperLimit }) => (
    <DetailedFilterNumIcon
      enabled={enabled}
      icon={'fairPlusPoor'}
      max={max}
      min={min}
      setEnabled={AnswerFilterAndSortStore.setEnabledFilteringByFairPlusPoor}
      upperLimit={upperLimit}
      onMaxChange={AnswerFilterAndSortStore.setFairPlusPoorMax}
      onMinChange={AnswerFilterAndSortStore.setFairPlusPoorMin}
    />
  ),
);
