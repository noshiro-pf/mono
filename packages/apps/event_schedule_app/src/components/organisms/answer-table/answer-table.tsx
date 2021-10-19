import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { roundBy } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { useAnswerTableHooks } from '../../../hooks';
import { CustomIcon, RequiredParticipantIcon } from '../../atoms';
import { BpTableBordered } from '../../bp';
import { CommentButton } from './comment-button';
import { DatetimeRangeCell } from './datetime-range-cell';
import { SortButton } from './sort-button';

type Props = Readonly<{
  eventSchedule: EventSchedule;
  answers: readonly Answer[];
  onAnswerClick: (answer: Answer) => void;
  isExpired: boolean;
}>;

const vt = texts.answerPage.answers;

export const AnswerTable = memoNamed<Props>(
  'AnswerTable',
  ({ eventSchedule, answers, onAnswerClick, isExpired }) => {
    const {
      answersWithHandler,
      tableBodyValues,
      onDatetimeSortChange,
      onScoreSortChange,
    } = useAnswerTableHooks(eventSchedule, answers, onAnswerClick);

    return (
      <BpTableBordered>
        <thead>
          <tr>
            <th>
              <PaddedSpan>{vt.datetime}</PaddedSpan>
              <SortButton onSortChange={onDatetimeSortChange} />
            </th>
            <th>
              <PaddedSpan>{vt.score}</PaddedSpan>
              <SortButton onSortChange={onScoreSortChange} />
            </th>

            {/* symbols */}
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
                {isExpired ? (
                  answer.userName
                ) : (
                  <BpButtonOverflowHidden
                    minimal={true}
                    title={answer.userName}
                    onClick={answer.onClick}
                  >
                    {answer.userName}
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
                      <SummaryCellUnit>{vt.numAnswersUnit}</SummaryCellUnit>
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
                              {`${texts.brace.start}${point}${texts.brace.end}`}
                            </CustomPointValue>
                          ) : undefined}
                          {weight !== 1.0 ? (
                            <WeightValue>
                              <WeightTimes>{vt.times}</WeightTimes>
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
            <td>{vt.comment}</td>

            {/* spacer */}
            <td />

            {/* spacer - symbols */}
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
      </BpTableBordered>
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

const BpButtonOverflowHidden = styled(BpButton)`
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
