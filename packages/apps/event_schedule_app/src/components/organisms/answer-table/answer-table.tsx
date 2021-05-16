import { HTMLTable } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { uint32 } from '@noshiro/ts-utils';
import { roundBy } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import type { IAnswer } from '../../../types/record/answer';
import type { IEventSchedule } from '../../../types/record/event-schedule';
import type { IList } from '../../../utils/immutable';
import { CustomIcon } from '../../atoms/icon';
import { Td, Th } from '../../atoms/table-cell-centered';
import { useAnswerTableHooks } from './answer-table-hooks';
import { CommentButton } from './comment-button';
import { DatetimeRangeCell } from './datetime-range-cell';
import { SortButton } from './sort-button';

type Props = Readonly<{
  eventSchedule: IEventSchedule;
  answers: IList<IAnswer>;
  onAnswerClick: (answer: IAnswer) => void;
  isExpired: boolean;
}>;

const vt = texts.answerPage.answers;

export const AnswerTable = memoNamed<Props>(
  'AnswerTable',
  ({ eventSchedule, answers, onAnswerClick, isExpired }) => {
    const {
      datetimeSpecification,
      answerSymbolList,
      answersWithHandler,
      tableBodyValues,
      onDatetimeSortChange,
      onScoreSortChange,
    } = useAnswerTableHooks(eventSchedule, answers, onAnswerClick);

    return (
      <HTMLTable bordered={true}>
        <thead>
          <tr>
            <Th style={tcellStyle}>
              <PaddedSpan>{vt.datetime}</PaddedSpan>
              <SortButton onSortChange={onDatetimeSortChange} />
            </Th>
            <Th style={tcellStyle}>
              <PaddedSpan>{vt.score}</PaddedSpan>
              <SortButton onSortChange={onScoreSortChange} />
            </Th>
            {answerSymbolList.map((s) => (
              <Th key={s.iconId} style={tcellStyle}>
                <CustomIcon iconName={s.iconId} />
              </Th>
            ))}
            {answersWithHandler.map((answer) => (
              <Th key={answer.id} style={nopadStyle}>
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
                <Td style={tcellStyle}>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={datetimeSpecification}
                  />
                </Td>
                <Td>
                  <span>{roundBy(2 as uint32, score)}</span>
                </Td>
                {answerSummaryRow?.map((s, i) => (
                  <Td style={tcellStyle} key={i}>
                    <SummaryCellStyle>
                      <span>{s}</span>
                      <SummaryCellUnit>{vt.numAnswersUnit}</SummaryCellUnit>
                    </SummaryCellStyle>
                  </Td>
                ))}
                {answerTableRow?.map((iconId, i) => (
                  <Td style={tcellStyle} key={i}>
                    {iconId === undefined ? (
                      ''
                    ) : (
                      <CustomIcon iconName={iconId} />
                    )}
                  </Td>
                ))}
              </tr>
            )
          )}
          <tr>
            <Td style={tcellStyle}>{vt.comment}</Td>
            <Td style={tcellStyle}></Td>
            {answerSymbolList.map((s) => (
              <Td key={s.iconId} style={tcellStyle}></Td>
            ))}
            {answersWithHandler.map((answer) => (
              <Td key={answer.id} style={nopadStyle}>
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

const tcellStyle: CSSProperties = {
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const nopadStyle: CSSProperties = {
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
