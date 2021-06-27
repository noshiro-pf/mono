import type {
  Answer,
  AnswerSymbol,
  AnswerSymbolIconId,
  DatetimeRange,
  DatetimeSpecificationEnumType,
  EventSchedule,
  Weight,
} from '@noshiro/event-schedule-app-api';
import type { DeepReadonly, IMapMapped } from '@noshiro/ts-utils';
import { IList, mapNullable, pipe } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { answerTableColor } from '../../../constants';
import type { DatetimeRangeMapKey } from '../../../functions';
import { createAnswerSummary, createScore } from './create-answer-summary';
import { useAnswerTable } from './use-answer-table';

type AnswerTableHooks = DeepReadonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  answerSymbolList: AnswerSymbol[];
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
            IList.reverse(eventSchedule.datetimeRangeList)
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
            IList.sortBy(
              eventSchedule.datetimeRangeList,
              (d) => scores.get(d) ?? 0
            )
          );
          break;
        case 'desc':
          setDatetimeRangeListReordered(
            pipe(eventSchedule.datetimeRangeList)
              .chain((list) => IList.sortBy(list, (d) => scores.get(d) ?? 0))
              .chain(IList.reverse).value
          );
          break;
      }
    },
    [eventSchedule.datetimeRangeList, scores]
  );

  const tableBodyValues = useMemo<
    DeepReadonly<
      {
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
          mapNullable((row) =>
            IList.zip(
              row,
              answers.map((a) => a.weight)
            )
          )
        ).value;

        return {
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
    datetimeSpecification: eventSchedule.datetimeSpecification,
    answerSymbolList: eventSchedule.answerSymbolList,
    answersWithHandler,
    tableBodyValues,
    onDatetimeSortChange,
    onScoreSortChange,
  };
};
