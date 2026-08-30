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

export const DetailedFilterNumFairIcon = memoNamed<Props>(
  'DetailedFilterNumFairIcon',
  ({ enabled, min, max, upperLimit }) => (
    <DetailedFilterNumIcon
      enabled={enabled}
      icon={'fair'}
      max={max}
      min={min}
      setEnabled={AnswerFilterAndSortStore.setEnabledFilteringByFairIcon}
      upperLimit={upperLimit}
      onMaxChange={AnswerFilterAndSortStore.setMaxCountOfFairIcon}
      onMinChange={AnswerFilterAndSortStore.setMinCountOfFairIcon}
    />
  ),
);
