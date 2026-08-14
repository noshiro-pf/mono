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

export const DetailedFilterNumGoodIcon = memoNamed<Props>(
  'DetailedFilterNumGoodIcon',
  ({ enabled, min, max, upperLimit }) => (
    <DetailedFilterNumIcon
      enabled={enabled}
      icon={'good'}
      max={max}
      min={min}
      setEnabled={AnswerFilterAndSortStore.setEnabledFilteringByGoodIcon}
      upperLimit={upperLimit}
      onMaxChange={AnswerFilterAndSortStore.setMaxCountOfGoodIcon}
      onMinChange={AnswerFilterAndSortStore.setMinCountOfGoodIcon}
    />
  ),
);
