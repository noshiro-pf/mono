import { HTMLTable } from '@blueprintjs/core';
import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { roundBy } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { useAnswerTableHooks } from '../../../hooks';
import { CustomIcon, RequiredParticipantIcon, Td, Th } from '../../atoms';
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
      <HTMLTable bordered={true}>
        <thead>
          <tr>
            <Th style={tCellStyle}>
              <PaddedSpan>{vt.datetime}</PaddedSpan>
              <SortButton onSortChange={onDatetimeSortChange} />
            </Th>
            <Th style={tCellStyle}>
              <PaddedSpan>{vt.score}</PaddedSpan>
              <SortButton onSortChange={onScoreSortChange} />
            </Th>
            {eventSchedule.answerSymbolList.map((s) => (
              <Th key={s.iconId} style={tCellStyle}>
                <CustomIcon iconName={s.iconId} />
              </Th>
            ))}
            {answersWithHandler.map((answer) => (
              <Th key={answer.id} style={noPadStyle}>
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
                  <div style={requiredParticipantIconStyle}>
                    <RequiredParticipantIcon />
                  </div>
                ) : undefined}
              </Th>
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
                <Td style={tCellStyle}>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={eventSchedule.datetimeSpecification}
                  />
                </Td>
                <Td>
                  <span>{roundBy(2, score)}</span>
                </Td>
                {answerSummaryRow?.map((s, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Td key={i} style={tCellStyle}>
                    <SummaryCellStyle>
                      <span>{s}</span>
                      <SummaryCellUnit>{vt.numAnswersUnit}</SummaryCellUnit>
                    </SummaryCellStyle>
                  </Td>
                ))}
                {answerTableRow?.map(([iconId, weight], i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Td key={i} style={tCellStyle}>
                    {iconId === undefined ? (
                      ''
                    ) : (
                      <AnswerIconCell>
                        <CustomIcon iconName={iconId} />
                        {weight !== 1.0 ? (
                          <WeightValue>
                            <WeightTimes>{vt.times}</WeightTimes>
                            <div>{weight}</div>
                          </WeightValue>
                        ) : undefined}
                      </AnswerIconCell>
                    )}
                  </Td>
                ))}
              </tr>
            )
          )}

          {/* コメント行 */}
          <tr>
            <Td style={tCellStyle}>{vt.comment}</Td>

            {/* spacer */}
            <Td style={tCellStyle} />
            {eventSchedule.answerSymbolList.map((s) => (
              <Td key={s.iconId} style={tCellStyle} />
            ))}

            {answersWithHandler.map((answer) => (
              <Td key={answer.id} style={noPadStyle}>
                <div>
                  {answer.comment === '' ? (
                    ''
                  ) : (
                    <CommentButton comment={answer.comment} />
                  )}
                </div>
              </Td>
            ))}
          </tr>
        </tbody>
      </HTMLTable>
    );
  }
);

const tCellStyle: CSSProperties = {
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
} as const;

const userNameWrapperWidth = 80;

const noPadStyle: CSSProperties = {
  minWidth: `${userNameWrapperWidth}px`,
  maxWidth: `${userNameWrapperWidth}px`,
  overflowX: 'hidden',
  padding: '5px',
  verticalAlign: 'middle',
  position: 'relative',
} as const;

const requiredParticipantIconStyle: CSSProperties = {
  position: 'absolute',
  top: '5px',
  right: '5px',
} as const;

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
`;

const WeightValue = styled.span`
  margin-left: 3px;
  display: flex;
  font-size: x-small;
`;

const WeightTimes = styled.span`
  margin: 0 1px;
`;
