import { AnswerFilterAndSortStore } from '../../../store';
import { DetailedFilterNumIcon } from './detailed-filter-num-icon';

type Props = Readonly<{
  enabled: boolean;
  min: number;
  max: number;
  upperLimit: number;
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
