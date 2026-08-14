import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { CheckboxView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { type DeepReadonly } from 'ts-type-forge';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { type AnswerRank } from '../../../types/index.mjs';
import { RankNumericInput } from '../../molecules/index.mjs';
import { CheckboxWrapper, FilterItem } from './styled.js';

const dc = dict.answerPage.detailedFilter;

type Props = DeepReadonly<{ enabled: boolean; rank: AnswerRank }>;

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
