import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { answerTableColor } from '../../../constants';
import type {
  AnswerSymbolIconId,
  DatetimeSpecificationEnumType,
  IAnswer,
  IAnswerSymbol,
  IDatetimeRange,
  IEventSchedule,
} from '../../../types';
import type { IList, IMap } from '../../../utils';
import { createAnswerSummary, createScore } from './create-answer-summary';
import { useAnswerTable } from './use-answer-table';

type AnswerTableHooks = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  answerSymbolList: IList<IAnswerSymbol>;
  answersWithHandler: IList<
    Readonly<{
      id: IAnswer['id'];
      userName: IAnswer['userName'];
      comment: IAnswer['comment'];
      onClick: () => void;
    }>
  >;
  onDatetimeSortChange: (state: 'asc' | 'desc') => void;
  onScoreSortChange: (state: 'asc' | 'desc') => void;

  tableBodyValues: IList<
    Readonly<{
      datetimeRange: IDatetimeRange;
      score: number;
      answerSummaryRow: IList<number> | undefined;
      answerTableRow: IList<AnswerSymbolIconId | undefined> | undefined;
      style: CSSProperties;
    }>
  >;
}>;

export const useAnswerTableHooks = (
  eventSchedule: IEventSchedule,
  answers: IList<IAnswer>,
  onAnswerClick: (answer: IAnswer) => void
): AnswerTableHooks => {
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

  const [datetimeRangeListReordered, setDatetimeRangeListReordered] = useState(
    eventSchedule.datetimeRangeList
  );

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

  return {
    datetimeSpecification: eventSchedule.datetimeSpecification,
    answerSymbolList: eventSchedule.answerSymbolList,
    answersWithHandler: answersWithHandler,
    tableBodyValues: tableBodyValues,
    onDatetimeSortChange: onDatetimeSortChange,
    onScoreSortChange: onScoreSortChange,
  };
};
