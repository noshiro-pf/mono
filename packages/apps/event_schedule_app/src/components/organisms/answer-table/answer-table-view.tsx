import { HTMLTable } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { DatetimeSpecificationEnumType } from '../../../types/enum/datetime-specification-type';
import { IAnswer } from '../../../types/record/answer';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IList } from '../../../utils/immutable';
import { roundBy } from '../../../utils/round-by';
import { BpButton } from '../../atoms/blueprint-js-wrapper/button';
import { CustomIcon } from '../../atoms/icon';
import { Td, Th } from '../../atoms/table-cell-centered';
import { DatetimeRangeCell } from '.././answer-table/datetime-range-cell';
import { CommentButton } from './comment-button';
import { SortButton } from './sort-button';

interface Props {
  datetimeRangeList: IList<IDatetimeRange>;
  datetimeSpecification: DatetimeSpecificationEnumType;
  answerSymbolList: IList<IAnswerSymbol>;
  answersWithHandler: IList<{
    id: IAnswer['id'];
    userName: IAnswer['userName'];
    comment: IAnswer['comment'];
    onClick: () => void;
  }>;
  onDatetimeSortChange: (state: 'asc' | 'desc') => void;
  onScoreSortChange: (state: 'asc' | 'desc') => void;

  tableBodyValues: IList<{
    datetimeRange: IDatetimeRange;
    score: number;
    answerSummaryRow: IList<number> | undefined;
    answerTableRow: IList<AnswerSymbolIconId | undefined> | undefined;
    style: CSSProperties;
  }>;
  isExpired: boolean;
}

const vt = texts.answerPage.answers;

export const AnswerTableView = memoNamed<Props>('AnswerTableView', (props) => (
  <HTMLTable bordered={true}>
    <thead>
      <tr>
        <Th style={tcellStyle}>
          <PaddedSpan>{vt.datetime}</PaddedSpan>
          <SortButton onSortChange={props.onDatetimeSortChange} />
        </Th>
        <Th style={tcellStyle}>
          <PaddedSpan>{vt.score}</PaddedSpan>
          <SortButton onSortChange={props.onScoreSortChange} />
        </Th>
        {props.answerSymbolList.map((s) => (
          <Th key={s.iconId} style={tcellStyle}>
            <CustomIcon name={s.iconId} />
          </Th>
        ))}
        {props.answersWithHandler.map((answer) => (
          <Th key={answer.id} style={nopadStyle}>
            {props.isExpired ? (
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
      {props.tableBodyValues.map(
        (
          { datetimeRange, score, answerSummaryRow, answerTableRow, style },
          key
        ) => (
          <tr key={key} style={style}>
            <Td style={tcellStyle}>
              <DatetimeRangeCell
                datetimeRange={datetimeRange}
                datetimeSpecification={props.datetimeSpecification}
              />
            </Td>
            <Td>
              <span>{roundBy(2, score)}</span>
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
                {iconId === undefined ? '' : <CustomIcon name={iconId} />}
              </Td>
            ))}
          </tr>
        )
      )}
      <tr>
        <Td style={tcellStyle}>{vt.comment}</Td>
        <Td style={tcellStyle}></Td>
        {props.answerSymbolList.map((s) => (
          <Td key={s.iconId} style={tcellStyle}></Td>
        ))}
        {props.answersWithHandler.map((answer) => (
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
));

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
