import { CheckboxView } from '@noshiro/react-blueprintjs-utils';
import { AnswerFilterAndSortStore } from '../../../store';
import { CheckboxWrapper, FilterItem } from './styled';

const dc = dict.answerPage.detailedFilter;

type Props = Readonly<{
  filledDateOnly: boolean;
}>;

/* 全員回答済みの候補日のみ表示 */
export const DetailedFilterFilledDateOnly = memoNamed<Props>(
  'DetailedFilterFilledDateOnly',
  ({ filledDateOnly }) => (
    <FilterItem>
      <CheckboxWrapper>
        <CheckboxView
          state={filledDateOnly ? 'checked' : 'none'}
          onCheck={AnswerFilterAndSortStore.setOnlyFilledDate}
        />
        <span>{dc.filterItems.filledDateOnly}</span>
      </CheckboxWrapper>
    </FilterItem>
  ),
);
