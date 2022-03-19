import { Button } from '@blueprintjs/core';
import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { roundBy } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useAnswerTableHooks } from '../../../hooks';
import { CustomIcon, RequiredParticipantIcon } from '../../atoms';
import { HTMLTableBorderedStyled } from '../../bp';
import { CommentButton } from './comment-button';
import { DatetimeRangeCell } from './datetime-range-cell';
import { SortButton } from './sort-button';

const dc = dict.answerPage.answers;

type Props = Readonly<{
  eventSchedule: EventSchedule;
  answers: readonly Answer[];
  onAnswerClick: (answer: Answer) => void;
  editAnswerButtonIsDisabled: boolean;
}>;

export const AnswerTable = memoNamed<Props>(
  'AnswerTable',
  ({ eventSchedule, answers, onAnswerClick, editAnswerButtonIsDisabled }) => {
    const {
      answersWithHandler,
      tableBodyValues,
      onDatetimeSortChange,
      onScoreSortChange,
    } = useAnswerTableHooks(eventSchedule, answers, onAnswerClick);

    return (
      <HTMLTableBorderedStyled>
        <thead>
          <tr>
            <th>
              <PaddedSpan>{dc.datetime}</PaddedSpan>
              <SortButton onSortChange={onDatetimeSortChange} />
            </th>
            <th>
              <PaddedSpan>{dc.score}</PaddedSpan>
              <SortButton onSortChange={onScoreSortChange} />
            </th>

            {/* icons */}
            <th>
              <CustomIcon iconName={'good'} />
            </th>
            <th>
              <CustomIcon iconName={'fair'} />
            </th>
            <th>
              <CustomIcon iconName={'poor'} />
            </th>

            {answersWithHandler.map((answer) => (
              <th key={answer.id} style={noPadStyle}>
                {editAnswerButtonIsDisabled ? (
                  answer.user.name
                ) : (
                  <BpButtonOverflowHidden
                    minimal={true}
                    title={answer.user.name}
                    onClick={answer.onClick}
                  >
                    {answer.user.name}
                  </BpButtonOverflowHidden>
                )}
                {answer.isRequiredParticipants ? (
                  <RequiredParticipantIconStyled>
                    <RequiredParticipantIcon />
                  </RequiredParticipantIconStyled>
                ) : undefined}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableBodyValues.map(
            ({
              key,
              datetimeRange,
              score,
              answerSummaryRow,
              answerTableRow,
              style,
            }) => (
              <tr key={key} style={style}>
                <td>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={eventSchedule.datetimeSpecification}
                  />
                </td>
                <td>
                  <span>{roundBy(2, score)}</span>
                </td>
                {answerSummaryRow?.map((s, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <td key={i}>
                    <SummaryCellStyle>
                      <span>{s}</span>
                      <SummaryCellUnit>{dc.numAnswersUnit}</SummaryCellUnit>
                    </SummaryCellStyle>
                  </td>
                ))}
                {answerTableRow?.map(
                  ({ iconId, point, showPoint, weight }, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <td key={i}>
                      {iconId === 'none' ? (
                        ''
                      ) : (
                        <AnswerIconCell>
                          <CustomIcon iconName={iconId} />
                          {showPoint ? (
                            <CustomPointValue>
                              {`${dict.common.brace.start}${point}${dict.common.brace.end}`}
                            </CustomPointValue>
                          ) : undefined}
                          {weight !== 1 ? (
                            <WeightValue>
                              <WeightTimes>{dc.times}</WeightTimes>
                              <div>{weight}</div>
                            </WeightValue>
                          ) : undefined}
                        </AnswerIconCell>
                      )}
                    </td>
                  )
                )}
              </tr>
            )
          )}

          {/* コメント行 */}
          <tr>
            <td>{dc.comment}</td>

            {/* spacer */}
            <td />

            {/* spacer - icons */}
            <td />
            <td />
            <td />

            {answersWithHandler.map((answer) => (
              <td key={answer.id} style={noPadStyle}>
                <div>
                  {answer.comment === '' ? (
                    ''
                  ) : (
                    <CommentButton comment={answer.comment} />
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </HTMLTableBorderedStyled>
    );
  }
);

const userNameWrapperWidth = 80;

const noPadStyle: CSSProperties = {
  minWidth: `${userNameWrapperWidth}px`,
  maxWidth: `${userNameWrapperWidth}px`,
  overflowX: 'hidden',
  padding: '5px',
  position: 'relative',
} as const;

const RequiredParticipantIconStyled = styled.div`
  position: absolute;
  top: -5px;
  left: 5px;
`;

const BpButtonOverflowHidden = styled(Button)`
  overflow-x: hidden;
`;

const SummaryCellStyle = styled.div`
  vertical-align: baseline;
`;

const SummaryCellUnit = styled.span`
  font-size: x-small;
`;

const PaddedSpan = styled.span`
  margin-right: 5px;
`;

const AnswerIconCell = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const CustomPointValue = styled.span`
  margin-left: 3px;
  display: flex;
  font-size: x-small;
`;

const WeightValue = styled.span`
  margin-left: 3px;
  display: flex;
  font-size: x-small;
`;

const WeightTimes = styled.span`
  margin: 0 1px;
`;
