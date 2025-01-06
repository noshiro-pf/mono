import { AnswerFilterAndSortStore } from '../../../store';
import { DetailedFilterNumIcon } from './detailed-filter-num-icon';

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
