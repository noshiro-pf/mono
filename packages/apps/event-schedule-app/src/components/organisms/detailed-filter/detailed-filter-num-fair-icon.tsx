import { AnswerFilterAndSortStore } from '../../../store';
import { DetailedFilterNumIcon } from './detailed-filter-num-icon';

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
