import { AnswerFilterAndSortStore } from '../../../store';
import { DetailedFilterNumIcon } from './detailed-filter-num-icon';

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
