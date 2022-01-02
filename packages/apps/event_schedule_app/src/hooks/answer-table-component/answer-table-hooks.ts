import type {
  Answer,
  DatetimeRange,
  EventSchedule,
} from '@noshiro/event-schedule-app-shared';
import type { IMapMapped } from '@noshiro/ts-utils';
import { IList, mapNullable, match, pipe } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { answerTableColor } from '../../constants';
import type { DatetimeRangeMapKey } from '../../functions';
import {
  createAnswerSummary,
  createScore,
  datetimeRange2str,
} from '../../functions';
import type { AnswerTableCell } from '../../types';
import { useAnswerTable } from './use-answer-table';

type AnswerTableHooks = DeepReadonly<{
  answersWithHandler: MergeIntersection<
    Pick<
      Answer,
      'comment' | 'id' | 'isRequiredParticipants' | 'userName' | 'weight'
    > & {
      onClick: () => void;
    }
  >[];
  tableBodyValues: {
    key: string;
    datetimeRange: DatetimeRange;
    score: number;
    answerSummaryRow: number[] | undefined;
    answerTableRow: AnswerTableCell[] | undefined;
    style: CSSProperties;
  }[];
  onDatetimeSortChange: (state: 'asc' | 'desc') => void;
  onScoreSortChange: (state: 'asc' | 'desc') => void;
}>;

export const useAnswerTableHooks = (
  eventSchedule: EventSchedule,
  answers: readonly Answer[],
  onAnswerClick: (answer: Answer) => void
): AnswerTableHooks => {
  const answerTable = useAnswerTable(eventSchedule, answers);

  // sum of (good, fair, poor)
  const answerSummary = useMemo<
    IMapMapped<DatetimeRange, readonly number[], DatetimeRangeMapKey>
  >(
    () => createAnswerSummary(eventSchedule.datetimeRangeList, answerTable),
    [eventSchedule, answerTable]
  );

  const scores = useMemo<
    IMapMapped<DatetimeRange, number, DatetimeRangeMapKey>
  >(
    () =>
      createScore(
        eventSchedule.datetimeRangeList,
        answerSummary,
        answerTable,
        answers
      ),
    [answerSummary, eventSchedule, answerTable, answers]
  );

  const answersWithHandler = useMemo<
    readonly (Pick<
      Answer,
      'comment' | 'id' | 'isRequiredParticipants' | 'userName' | 'weight'
    > & {
      readonly onClick: () => void;
    })[]
  >(
    () =>
      answers.map((a) => ({
        id: a.id,
        userName: a.userName,
        comment: a.comment,
        weight: a.weight,
        isRequiredParticipants: a.isRequiredParticipants,
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

  const [
    //
    [sortKey, sortOrder],
    setSortOrderAndKey,
  ] = useState<readonly ['date' | 'score', 'asc' | 'desc']>(['date', 'asc']);

  const onDatetimeSortChange = useCallback((state: 'asc' | 'desc'): void => {
    setSortOrderAndKey(['date', state]);
  }, []);

  const onScoreSortChange = useCallback((state: 'asc' | 'desc'): void => {
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
        answerTableRow: AnswerTableCell[] | undefined;
        style: CSSProperties;
      }[]
    >
  >(
    () =>
      datetimeRangeListReordered.map((datetimeRange) => {
        const score = scores.get(datetimeRange) ?? 0;

        const answerTableRow: readonly AnswerTableCell[] | undefined = pipe(
          answerTable.get(datetimeRange)
        ).chain((list) =>
          mapNullable(list, (row) =>
            IList.zip(
              row,
              answers.map((a) => a.weight)
            ).map(([[iconId, point], weight]) => ({
              iconId,
              point,
              showPoint: match(iconId, {
                good: point !== eventSchedule.answerIcons.good.point,
                fair: point !== eventSchedule.answerIcons.fair.point,
                poor: point !== eventSchedule.answerIcons.poor.point,
                none: false,
              }),
              weight,
            }))
          )
        ).value;

        return {
          key: datetimeRange2str(datetimeRange),
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
    [
      datetimeRangeListReordered,
      scores,
      answerSummary,
      answerTable,
      eventSchedule.answerIcons,
      answers,
    ]
  );

  return {
    answersWithHandler,
    tableBodyValues,
    onDatetimeSortChange,
    onScoreSortChange,
  };
};
