import { AnswerFilterAndSortStore } from '../../../store';
import { type AnswerRank } from '../../../types';
import { CheckboxView } from '../../bp';
import { RankNumericInput } from '../../molecules';
import { CheckboxWrapper, FilterItem } from './styled';

const dc = dict.answerPage.detailedFilter;

type Props = DeepReadonly<{
  enabled: boolean;
  rank: AnswerRank;
}>;

export const DetailedFilterRank = memoNamed<Props>(
  'DetailedFilterRank',
  ({ enabled, rank }) => (
    <FilterItem>
      <CheckboxWrapper>
        <CheckboxView
          state={enabled ? 'checked' : 'none'}
          onCheck={AnswerFilterAndSortStore.setEnabledFilteringByRank}
        />
      </CheckboxWrapper>
      <div
        css={css`
          display: flex;
          margin-right: 40px;
          align-items: center;

          & > * {
            margin: 3px;
          }
        `}
      >
        <SimpleText>{dc.filterItems.rankPrefix}</SimpleText>

        <div
          css={css`
            max-width: 80px;
          `}
        >
          <RankNumericInput
            disabled={!enabled}
            value={rank}
            onValueChange={AnswerFilterAndSortStore.setRank}
          />
        </div>

        <SimpleText>{dc.filterItems.rankSuffix}</SimpleText>
      </div>
    </FilterItem>
  ),
);

const SimpleText = styled.span`
  white-space: nowrap;
`;
