import { Collapse } from '@blueprintjs/core';
import { AnswerFilterAndSortStore } from '../../../store';
import { DetailedFilterDateRange } from './detailed-filter-date-range';
import { DetailedFilterDayOfWeek } from './detailed-filter-day-of-week';
import { DetailedFilterFilledDateOnly } from './detailed-filter-filled-date-only';
import { DetailedFilterIconOfSpecifiedRespondent } from './detailed-filter-icon-of-specified-respondent';
import { DetailedFilterNumFairIcon } from './detailed-filter-num-fair-icon';
import { DetailedFilterNumFairPlusPoorIcon } from './detailed-filter-num-fair-plus-poor-icon';
import { DetailedFilterNumGoodIcon } from './detailed-filter-num-good-icon';
import { DetailedFilterNumGoodPlusFairIcon } from './detailed-filter-num-good-plus-fair-icon';
import { DetailedFilterNumPoorIcon } from './detailed-filter-num-poor-icon';
import { DetailedFilterScoreRange } from './detailed-filter-score-range';

type Props = DeepReadonly<{
  isOpen: boolean;
}>;

export const DetailedFilterCollapse = memoNamed<Props>(
  'DetailedFilterCollapse',
  ({ isOpen }) => {
    const {
      dateRange,
      dayOfWeek,
      filledDateOnly,
      iconOfSpecifiedRespondent,
      iconState,
      scoreRange,
    } = useObservableValue(AnswerFilterAndSortStore.filterState$);

    const iconOfSpecifiedRespondentCheckState = useObservableValue(
      AnswerFilterAndSortStore.iconOfSpecifiedRespondentCheckState$
    );

    return (
      <Collapse isOpen={isOpen}>
        <Body>
          <BodyContent>
            <DetailedFilterDateRange
              dateRange={dateRange.defaultValue}
              state={dateRange}
            />

            <DetailedFilterDayOfWeek state={dayOfWeek} />

            <DetailedFilterScoreRange
              enabled={scoreRange.enabled}
              range={scoreRange.value}
            />

            <hr />

            <Title>
              {dict.answerPage.detailedFilter.filterItems.answerIcon}
            </Title>

            <DetailedFilterNumGoodIcon
              enabled={iconState.good.enabled}
              max={iconState.good.max}
              min={iconState.good.min}
              upperLimit={iconState.upperLimit}
            />
            <DetailedFilterNumFairIcon
              enabled={iconState.fair.enabled}
              max={iconState.fair.max}
              min={iconState.fair.min}
              upperLimit={iconState.upperLimit}
            />
            <DetailedFilterNumPoorIcon
              enabled={iconState.poor.enabled}
              max={iconState.poor.max}
              min={iconState.poor.min}
              upperLimit={iconState.upperLimit}
            />

            <DetailedFilterNumGoodPlusFairIcon
              enabled={iconState.goodPlusFair.enabled}
              max={iconState.goodPlusFair.max}
              min={iconState.goodPlusFair.min}
              upperLimit={iconState.upperLimit}
            />
            <DetailedFilterNumFairPlusPoorIcon
              enabled={iconState.fairPlusPoor.enabled}
              max={iconState.fairPlusPoor.max}
              min={iconState.fairPlusPoor.min}
              upperLimit={iconState.upperLimit}
            />

            <DetailedFilterFilledDateOnly filledDateOnly={filledDateOnly} />

            {iconOfSpecifiedRespondentCheckState === undefined ? undefined : (
              <DetailedFilterIconOfSpecifiedRespondent
                checkState={iconOfSpecifiedRespondentCheckState}
                enabled={iconOfSpecifiedRespondent.enabled}
                fairDisabled={
                  iconState.fair.max === 0 ||
                  iconState.goodPlusFair.max === 0 ||
                  iconState.fairPlusPoor.max === 0
                }
                goodDisabled={
                  iconState.good.max === 0 || iconState.goodPlusFair.max === 0
                }
                noneDisabled={filledDateOnly}
                poorDisabled={
                  iconState.poor.max === 0 || iconState.fairPlusPoor.max === 0
                }
              />
            )}
          </BodyContent>
        </Body>
      </Collapse>
    );
  }
);

const Title = styled.div`
  margin-top: 20px;
  margin-bottom: 15px;
`;

const Body = styled.div`
  margin-bottom: 10px;
  overflow-x: auto;
`;

const BodyContent = styled.div`
  padding: 10px;
  width: 350px;
  border: solid 1px rgba(16, 22, 26, 0.15);
  border-radius: 10px;
`;