import { HTMLTable } from '@blueprintjs/core';
import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { uint32 } from '@noshiro/ts-utils';
import { roundBy } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { CustomIcon, Td, Th } from '../../atoms';
import { useAnswerTableHooks } from './answer-table-hooks';
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
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableBodyValues.map(
            (
              { datetimeRange, score, answerSummaryRow, answerTableRow, style },
              key
            ) => (
              <tr key={key} style={style}>
                <Td style={tCellStyle}>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={eventSchedule.datetimeSpecification}
                  />
                </Td>
                <Td>
                  <span>{roundBy(2 as uint32, score)}</span>
                </Td>
                {answerSummaryRow?.map((s, i) => (
                  <Td key={i} style={tCellStyle}>
                    <SummaryCellStyle>
                      <span>{s}</span>
                      <SummaryCellUnit>{vt.numAnswersUnit}</SummaryCellUnit>
                    </SummaryCellStyle>
                  </Td>
                ))}
                {answerTableRow?.map(([iconId, weight], i) => (
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
};

const noPadStyle: CSSProperties = {
  minWidth: '80px',
  maxWidth: '80px',
  overflowX: 'hidden',
  padding: '5px',
  verticalAlign: 'middle',
};

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
