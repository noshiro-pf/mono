import { memoNamed } from '@mono/react-utils';
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { answerTableColor } from '../../../constants/answer-table-color';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { IAnswer } from '../../../types/record/answer';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { IList, IMap } from '../../../utils/immutable';
import { AnswerTableView } from './answer-table-view';
import { createAnswerSummary, createScore } from './create-answer-summary';
import { useAnswerTable } from './use-answer-table';

interface Props {
  eventSchedule: IEventSchedule;
  answers: IList<IAnswer>;
  onAnswerClick: (answer: IAnswer) => void;
  isExpired: boolean;
}

export const AnswerTable = memoNamed<Props>(
  'AnswerTable',
  ({ eventSchedule, answers, onAnswerClick, isExpired }) => {
    const answerTable = useAnswerTable(eventSchedule, answers);

    const answerSummary = useMemo<IMap<IDatetimeRange, IList<number>>>(
      () =>
        createAnswerSummary(
          eventSchedule.datetimeRangeList,
          eventSchedule.answerSymbolList,
          answerTable
        ),
      [eventSchedule, answerTable]
    );

    const scores = useMemo<IMap<IDatetimeRange, number>>(
      () =>
        createScore(
          eventSchedule.datetimeRangeList,
          eventSchedule.answerSymbolList,
          answerSummary,
          answers.size
        ),
      [answerSummary, eventSchedule, answers.size]
    );

    const answersWithHandler = useMemo<
      IList<{
        id: IAnswer['id'];
        userName: IAnswer['userName'];
        comment: IAnswer['comment'];
        onClick: () => void;
      }>
    >(
      () =>
        answers.map((a) => ({
          id: a.id,
          userName: a.userName,
          comment: a.comment,
          onClick: () => {
            onAnswerClick(a);
          },
        })),
      [answers, onAnswerClick]
    );

    const [
      datetimeRangeListReordered,
      setDatetimeRangeListReordered,
    ] = useState(eventSchedule.datetimeRangeList);

    useEffect(() => {
      setDatetimeRangeListReordered(eventSchedule.datetimeRangeList);
    }, [eventSchedule.datetimeRangeList]);

    const onDatetimeSortChange = useCallback(
      (state: 'asc' | 'desc') => {
        switch (state) {
          case 'asc':
            setDatetimeRangeListReordered(eventSchedule.datetimeRangeList);
            break;
          case 'desc':
            setDatetimeRangeListReordered(
              eventSchedule.datetimeRangeList.reverse()
            );
            break;
        }
      },
      [eventSchedule.datetimeRangeList]
    );

    const onScoreSortChange = useCallback(
      (state: 'asc' | 'desc') => {
        switch (state) {
          case 'asc':
            setDatetimeRangeListReordered(
              eventSchedule.datetimeRangeList.sortBy((d) => scores.get(d) ?? 0)
            );
            break;
          case 'desc':
            setDatetimeRangeListReordered(
              eventSchedule.datetimeRangeList
                .sortBy((d) => scores.get(d) ?? 0)
                .reverse()
            );
            break;
        }
      },
      [eventSchedule.datetimeRangeList, scores]
    );

    const tableBodyValues = useMemo<
      IList<{
        datetimeRange: IDatetimeRange;
        score: number;
        answerSummaryRow: IList<number> | undefined;
        answerTableRow: IList<AnswerSymbolIconId | undefined> | undefined;
        style: CSSProperties;
      }>
    >(
      () =>
        datetimeRangeListReordered.map((datetimeRange) => {
          const score = scores.get(datetimeRange) ?? 0;
          return {
            datetimeRange,
            score,
            answerSummaryRow: answerSummary.get(datetimeRange),
            answerTableRow: answerTable.get(datetimeRange),
            style: {
              backgroundColor:
                score === 1
                  ? answerTableColor.perfectColor
                  : score >= answerTableColor.goodThreshold
                  ? answerTableColor.goodColor
                  : undefined,
            },
          };
        }),
      [datetimeRangeListReordered, scores, answerSummary, answerTable]
    );

    return (
      <AnswerTableView
        datetimeRangeList={datetimeRangeListReordered}
        datetimeSpecification={eventSchedule.datetimeSpecification}
        answerSymbolList={eventSchedule.answerSymbolList}
        answersWithHandler={answersWithHandler}
        tableBodyValues={tableBodyValues}
        onDatetimeSortChange={onDatetimeSortChange}
        onScoreSortChange={onScoreSortChange}
        isExpired={isExpired}
      />
    );
  }
);
