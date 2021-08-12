import type {
  Answer,
  AnswerSymbolIconId,
  DatetimeRange,
  EventSchedule,
  Weight,
} from '@noshiro/event-schedule-app-shared';
import type { DeepReadonly, IMapMapped } from '@noshiro/ts-utils';
import { IList, mapNullable, pipe } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { answerTableColor } from '../../../constants';
import type { DatetimeRangeMapKey } from '../../../functions';
import { datetimeRange2Str } from '../../../functions';
import { createAnswerSummary, createScore } from './create-answer-summary';
import { useAnswerTable } from './use-answer-table';

type AnswerTableHooks = DeepReadonly<{
  answersWithHandler: {
    id: Answer['id'];
    userName: Answer['userName'];
    comment: Answer['comment'];
    weight: Answer['weight'];
    onClick: () => void;
  }[];
  onDatetimeSortChange: (state: 'asc' | 'desc') => void;
  onScoreSortChange: (state: 'asc' | 'desc') => void;
  tableBodyValues: {
    key: string;
    datetimeRange: DatetimeRange;
    score: number;
    answerSummaryRow: number[] | undefined;
    answerTableRow: [AnswerSymbolIconId | undefined, Weight][] | undefined;
    style: CSSProperties;
  }[];
}>;

export const useAnswerTableHooks = (
  eventSchedule: EventSchedule,
  answers: readonly Answer[],
  onAnswerClick: (answer: Answer) => void
): AnswerTableHooks => {
  const answerTable = useAnswerTable(eventSchedule, answers);

  const answerSummary = useMemo<
    IMapMapped<DatetimeRange, readonly number[], DatetimeRangeMapKey>
  >(
    () =>
      createAnswerSummary(
        eventSchedule.datetimeRangeList,
        eventSchedule.answerSymbolList,
        answerTable
      ),
    [eventSchedule, answerTable]
  );

  const scores = useMemo<
    IMapMapped<DatetimeRange, number, DatetimeRangeMapKey>
  >(
    () =>
      createScore(
        eventSchedule.datetimeRangeList,
        eventSchedule.answerSymbolList,
        answerSummary,
        answerTable,
        answers
      ),
    [answerSummary, eventSchedule, answerTable, answers]
  );

  const answersWithHandler = useMemo<
    readonly (Pick<Answer, 'comment' | 'id' | 'userName' | 'weight'> & {
      readonly onClick: () => void;
    })[]
  >(
    () =>
      answers.map((a) => ({
        id: a.id,
        userName: a.userName,
        comment: a.comment,
        weight: a.weight,
        onClick: () => {
          onAnswerClick(a);
        },
      })),
    [answers, onAnswerClick]
  );

  // 4 patterns of sorted lists

  const datetimeRangeList = eventSchedule.datetimeRangeList;

  const datetimeRangeListReversed = useMemo(
    () => IList.reverse(eventSchedule.datetimeRangeList),
    [eventSchedule.datetimeRangeList]
  );

  const datetimeRangeListSortedByScores = useMemo(
    () =>
      IList.sortBy(eventSchedule.datetimeRangeList, (d) => scores.get(d) ?? 0),
    [eventSchedule.datetimeRangeList, scores]
  );

  const datetimeRangeListSortedByScoresReversed = useMemo(
    () => IList.reverse(datetimeRangeListSortedByScores),
    [datetimeRangeListSortedByScores]
  );

  const [[sortKey, sortOrder], setSortOrderAndKey] = useState<
    readonly ['date' | 'score', 'asc' | 'desc']
  >(['date', 'asc']);

  const onDatetimeSortChange = useCallback((state: 'asc' | 'desc') => {
    setSortOrderAndKey(['date', state]);
  }, []);

  const onScoreSortChange = useCallback((state: 'asc' | 'desc') => {
    setSortOrderAndKey(['score', state]);
  }, []);

  const datetimeRangeListReordered = useMemo(
    () =>
      sortKey === 'date'
        ? sortOrder === 'asc'
          ? datetimeRangeList
          : datetimeRangeListReversed
        : sortOrder === 'asc'
        ? datetimeRangeListSortedByScores
        : datetimeRangeListSortedByScoresReversed,
    [
      sortKey,
      sortOrder,
      datetimeRangeList,
      datetimeRangeListReversed,
      datetimeRangeListSortedByScores,
      datetimeRangeListSortedByScoresReversed,
    ]
  );

  const tableBodyValues = useMemo<
    DeepReadonly<
      {
        key: string;
        datetimeRange: DatetimeRange;
        score: number;
        answerSummaryRow: number[] | undefined;
        answerTableRow: [AnswerSymbolIconId | undefined, Weight][] | undefined;
        style: CSSProperties;
      }[]
    >
  >(
    () =>
      datetimeRangeListReordered.map((datetimeRange) => {
        const score = scores.get(datetimeRange) ?? 0;

        const answerTableRow = pipe(answerTable.get(datetimeRange)).chain(
          (list) =>
            mapNullable(list, (row) =>
              IList.zip(
                row,
                answers.map((a) => a.weight)
              )
            )
        ).value;

        return {
          key: datetimeRange2Str(datetimeRange),
          datetimeRange,
          score,
          answerSummaryRow: answerSummary.get(datetimeRange),
          answerTableRow,
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
    [datetimeRangeListReordered, scores, answerSummary, answerTable, answers]
  );

  return {
    answersWithHandler,
    tableBodyValues,
    onDatetimeSortChange,
    onScoreSortChange,
  };
};
