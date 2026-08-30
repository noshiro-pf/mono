import { CheckboxView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxWrapper, FilterItem } from './styled.js';

const dc = dict.answerPage.detailedFilter;

type Props = Readonly<{ filledDateOnly: boolean }>;

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
