import { AnswerFilterAndSortStore } from '../../../store';
import { DetailedFilterNumIcon } from './detailed-filter-num-icon';

type Props = Readonly<{
  enabled: boolean;
  min: number;
  max: number;
  upperLimit: number;
}>;

export const DetailedFilterNumPoorIcon = memoNamed<Props>(
  'DetailedFilterNumPoorIcon',
  ({ enabled, min, max, upperLimit }) => (
    <DetailedFilterNumIcon
      enabled={enabled}
      icon={'poor'}
      max={max}
      min={min}
      setEnabled={AnswerFilterAndSortStore.setEnabledFilteringByPoorIcon}
      upperLimit={upperLimit}
      onMaxChange={AnswerFilterAndSortStore.setMaxCountOfPoorIcon}
      onMinChange={AnswerFilterAndSortStore.setMinCountOfPoorIcon}
    />
  )
);
