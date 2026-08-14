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

export const DetailedFilterNumGoodPlusFairIcon = memoNamed<Props>(
  'DetailedFilterNumGoodPlusFairIcon',
  ({ enabled, min, max, upperLimit }) => (
    <DetailedFilterNumIcon
      enabled={enabled}
      icon={'goodPlusFair'}
      max={max}
      min={min}
      setEnabled={AnswerFilterAndSortStore.setEnabledFilteringByGoodPlusFair}
      upperLimit={upperLimit}
      onMaxChange={AnswerFilterAndSortStore.setGoodPlusFairMax}
      onMinChange={AnswerFilterAndSortStore.setGoodPlusFairMin}
    />
  ),
);
