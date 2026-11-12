import { UserName } from 'event-schedule-app-shared';
import {
  type InitializedObservable,
  createBooleanState,
  derive,
  map,
} from 'synstate';
import {
  Arr,
  IMapMapped,
  Num,
  Optional,
  expectType,
  ifThen,
  mapNullable,
  match,
  pipe,
  tp,
} from 'ts-data-forge';
import { compareYearMonthDate } from 'ts-fortress-types';
import type { DeepReadonly, FixedLengthTuple, StrictPick } from 'ts-type-forge';
import { answerTableColor, datetimeRange2str } from '../../constants/index.mjs';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerSummary,
  createAnswerTable,
  createScore,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../../functions/index.mjs';
import type {
  AnswerTableCell,
  AnswerTableCellPosition,
} from '../../types/index.mjs';
import { ymd2day } from '../../utils/index.mjs';
import type { AnswerFilterAndSort } from './answer-filter-sort-state.mjs';

export type AnswerTableDeps = Readonly<{
  eventSchedule$: InitializedObservable<EventSchedule | undefined>;
  filterAndSort: StrictPick<
    AnswerFilterAndSort,
    'answersFiltered$' | 'filterState$' | 'sortKeyAndOrder$'
  >;
}>;

/**
 * The answer table's rows and cells, as filtered and sorted, and how the table
 * is shown.
 */
export const createAnswerTableStore = (deps: AnswerTableDeps): AnswerTable => {
  const answerSelectionMap$: InitializedObservable<
    | IMapMapped<
        AnswerTableCellPosition,
        readonly [
          iconId: AnswerIconIdWithNone,
          point: AnswerIconPoint,
          comment: string,
        ],
        AnswerSelectionMapKey
      >
    | undefined
  > = deps.filterAndSort.answersFiltered$.pipe(
    map(mapNullable(createAnswerSelectionMapFromAnswers)),
  );

  const answerSelectionMapFn$ = answerSelectionMap$.pipe(
    map(
      (answerSelectionMap) =>
        (
          datetimeRange: DatetimeRange,
          answerId: AnswerId,
        ): readonly [
          iconId: AnswerIconIdWithNone,
          point: AnswerIconPoint,
          comment: string,
        ] =>
          mapNullable(answerSelectionMap, (__m) =>
            Optional.toNullable(__m.get({ datetimeRange, answerId })),
          ) ?? tp('none', 0, ''),
    ),
  );

  const answerTable$: InitializedObservable<
    | IMapMapped<
        DatetimeRange,
        DeepReadonly<
          [
            iconId: AnswerIconIdWithNone,
            point: AnswerIconPoint,
            comment: string,
          ][]
        >,
        DatetimeRangeMapKey
      >
    | undefined
  > = derive(
    [
      deps.eventSchedule$,
      answerSelectionMapFn$,
      deps.filterAndSort.answersFiltered$,
    ],
    (eventSchedule, answerSelectionMapFn, answers) =>
      eventSchedule === undefined || answers === undefined
        ? undefined
        : createAnswerTable(
            answerSelectionMapFn,
            eventSchedule.datetimeRangeList,
            answers,
          ),
  );

  // sum of (good, fair, poor)
  const answerSummary$: InitializedObservable<
    | IMapMapped<
        DatetimeRange,
        FixedLengthTuple<3, number>,
        DatetimeRangeMapKey
      >
    | undefined
  > = derive(
    [deps.eventSchedule$, answerTable$],
    (eventSchedule, answerTable) =>
      eventSchedule === undefined || answerTable === undefined
        ? undefined
        : createAnswerSummary(eventSchedule.datetimeRangeList, answerTable),
  );

  const scores$: InitializedObservable<
    IMapMapped<DatetimeRange, number, DatetimeRangeMapKey> | undefined
  > = derive(
    [
      deps.eventSchedule$,
      answerSummary$,
      answerTable$,
      deps.filterAndSort.answersFiltered$,
    ],
    (eventSchedule, answerSummary, answerTable, answers) =>
      eventSchedule === undefined ||
      answerSummary === undefined ||
      answerTable === undefined ||
      answers === undefined
        ? undefined
        : createScore(
            eventSchedule.datetimeRangeList,
            answerSummary,
            answerTable,
            answers,
          ),
  );

  const datetimeRangeList$ = deps.eventSchedule$.pipe(
    map((eventSchedule) => eventSchedule?.datetimeRangeList),
  );

  const datetimeRangeListReversed$ = deps.eventSchedule$.pipe(
    map((eventSchedule) => eventSchedule?.datetimeRangeList.toReversed()),
  );

  const datetimeRangeListSortedByScores$ = derive(
    [deps.eventSchedule$, scores$],
    (eventSchedule, scores) =>
      eventSchedule === undefined || scores === undefined
        ? undefined
        : Arr.toSortedBy(
            eventSchedule.datetimeRangeList,
            (d) => Optional.toNullable(scores.get(d)) ?? 0,
          ),
  );

  const datetimeRangeListSortedByScoresReversed$ =
    datetimeRangeListSortedByScores$.pipe(
      map((datetimeRangeListSortedByScores) =>
        datetimeRangeListSortedByScores?.toReversed(),
      ),
    );

  const datetimeRangeListReordered$ = derive(
    [
      deps.filterAndSort.sortKeyAndOrder$,
      datetimeRangeList$,
      datetimeRangeListReversed$,
      datetimeRangeListSortedByScores$,
      datetimeRangeListSortedByScoresReversed$,
    ],
    (
      [sortKey, sortOrder],
      datetimeRangeList,
      datetimeRangeListReversed,
      datetimeRangeListSortedByScores,
      datetimeRangeListSortedByScoresReversed,
    ) =>
      sortKey === 'date'
        ? sortOrder === 'asc'
          ? datetimeRangeList
          : datetimeRangeListReversed
        : sortOrder === 'asc'
          ? datetimeRangeListSortedByScores
          : datetimeRangeListSortedByScoresReversed,
  );

  const datetimeRangeToTableRowValuesMap$: InitializedObservable<
    | IMapMapped<
        DatetimeRange,
        DeepReadonly<{
          key: string;
          datetimeRange: DatetimeRange;
          score: number;
          answerSummaryRow: FixedLengthTuple<3, number> | undefined;
          answerTableRow: AnswerTableCell[] | undefined;
          /** The row's background, by its score. */
          backgroundColor: string | undefined;
        }>,
        string
      >
    | undefined
  > = derive(
    [
      datetimeRangeList$,
      scores$,
      answerSummary$,
      answerTable$,
      deps.eventSchedule$,
      deps.filterAndSort.answersFiltered$,
    ],
    (
      datetimeRangeList,
      scores,
      answerSummary,
      answerTable,
      eventSchedule,
      answers,
    ) =>
      datetimeRangeList === undefined ||
      scores === undefined ||
      answerSummary === undefined ||
      answerTable === undefined ||
      eventSchedule === undefined ||
      answers === undefined
        ? undefined
        : IMapMapped.create(
            datetimeRangeList.map((datetimeRange) => {
              const score = Optional.toNullable(scores.get(datetimeRange)) ?? 0;

              const answerTableRow: readonly AnswerTableCell[] | undefined =
                pipe(
                  Optional.toNullable(answerTable.get(datetimeRange)),
                ).mapNullable((row) =>
                  Arr.zip(
                    row,
                    answers.map((a) => a.weight),
                  ).map(([[iconId, point, comment], weight]) => ({
                    iconId,
                    point,
                    showPoint: match(iconId, {
                      good: point !== eventSchedule.answerIcons.good.point,
                      fair: point !== eventSchedule.answerIcons.fair.point,
                      poor: point !== eventSchedule.answerIcons.poor.point,
                      none: false,
                    }),
                    weight,
                    comment,
                  })),
                ).value;

              const value: DeepReadonly<{
                key: string;
                datetimeRange: DatetimeRange;
                score: number;
                answerSummaryRow: FixedLengthTuple<3, number> | undefined;
                answerTableRow: AnswerTableCell[] | undefined;
                /** The row's background, by its score. */
                backgroundColor: string | undefined;
              }> = {
                key: datetimeRange2str(datetimeRange),
                datetimeRange,
                score,
                answerSummaryRow: Optional.toNullable(
                  answerSummary.get(datetimeRange),
                ),
                answerTableRow,
                backgroundColor:
                  score === 1
                    ? answerTableColor.perfectColor
                    : score >= answerTableColor.goodThreshold
                      ? answerTableColor.goodColor
                      : undefined,
              } as const;

              return tp(datetimeRange, value);
            }),
            datetimeRangeToMapKey,
            datetimeRangeFromMapKey,
          ),
  );

  const tableBodyValues$: InitializedObservable<
    DeepReadonly<
      {
        key: string;
        datetimeRange: DatetimeRange;
        score: number;
        answerSummaryRow: FixedLengthTuple<3, number> | undefined;
        answerTableRow: AnswerTableCell[] | undefined;
        /** The row's background, by its score. */
        backgroundColor: string | undefined;
      }[]
    >
  > = derive(
    [datetimeRangeListReordered$, datetimeRangeToTableRowValuesMap$],
    (datetimeRangeListReordered, datetimeRangeToTableRowValuesMap) =>
      datetimeRangeListReordered === undefined ||
      datetimeRangeToTableRowValuesMap === undefined
        ? []
        : datetimeRangeListReordered.map((datetimeRange) =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Optional.toNullable(
              datetimeRangeToTableRowValuesMap.get(datetimeRange),
            )!,
          ),
  );

  const tableBodyValuesFiltered$ = derive(
    [
      tableBodyValues$,
      deps.filterAndSort.filterState$,
      deps.filterAndSort.answersFiltered$,
    ],
    (tableBodyValues, filterState, answers) => {
      const tableBodyValuesFiltered = tableBodyValues.filter((row) => {
        const { answerTableRow, answerSummaryRow, score, datetimeRange } = row;

        if (answerSummaryRow === undefined || answerTableRow === undefined) {
          return false;
        }

        const numAnswers = answerTableRow.length;

        const [good, fair, poor] = answerSummaryRow;

        const {
          iconState: {
            good: goodBounds,
            fair: fairBounds,
            poor: poorBounds,
            fairPlusPoor: fairPlusPoorBounds,
            goodPlusFair: goodPlusFairBounds,
          },
          iconOfSpecifiedRespondent: { falseKeys },
          filledDateOnly,
          scoreRange,
          dayOfWeek,
          dateRange,
          ..._rest
        } = filterState;

        expectType<keyof typeof _rest, 'rank' | 'respondent'>('=');

        const { Sun, Mon, Tue, Wed, Thr, Fri, Sat } = dayOfWeek.value;

        const { start: dateStart, end: dateEnd } = dateRange.value;

        const day = ymd2day(datetimeRange.ymd);

        return (
          // 記号個数で絞り込み
          Num.isInRangeInclusive(goodBounds.min, goodBounds.max)(good) &&
          Num.isInRangeInclusive(fairBounds.min, fairBounds.max)(fair) &&
          Num.isInRangeInclusive(poorBounds.min, poorBounds.max)(poor) &&
          Num.isInRangeInclusive(
            goodPlusFairBounds.min,
            goodPlusFairBounds.max,
          )(good + fair) &&
          Num.isInRangeInclusive(
            fairPlusPoorBounds.min,
            fairPlusPoorBounds.max,
          )(fair + poor) &&
          // 全員回答済みの候補日のみ表示
          ifThen(filledDateOnly, good + fair + poor === numAnswers) &&
          // 指定した回答者の記号で絞り込み
          answerTableRow.every(
            (cell, index: number) =>
              !falseKeys.has([
                answers?.[index]?.user.name ?? UserName.cast(''),
                cell.iconId,
              ]),
          ) &&
          // スコアで絞り込み
          Num.isInRangeInclusive(
            scoreRange.value.min,
            scoreRange.value.max,
          )(score) &&
          // 曜日で絞り込み
          tp(Sun, Mon, Tue, Wed, Thr, Fri, Sat)[day] &&
          // 日程範囲で絞り込み
          (dateStart === undefined ||
            compareYearMonthDate(dateStart, datetimeRange.ymd) <= 0) &&
          (dateEnd === undefined ||
            compareYearMonthDate(datetimeRange.ymd, dateEnd) <= 0)
        );
      });

      if (!filterState.rank.enabled) {
        return tableBodyValuesFiltered;
      }

      const scoreThreshold = pipe(tableBodyValuesFiltered)
        .map((ar) => ar.map((a) => a.score))
        .map(
          (ar) => ar.toSorted((a, b) => b - a)[filterState.rank.value - 1],
        ).value;

      return tableBodyValuesFiltered.filter(
        (row) =>
          // スコア上位のみ表示
          scoreThreshold === undefined || row.score >= scoreThreshold,
      );
    },
  );

  const [tableIsMinimized$, { toggle: toggleTableIsMinimized }] =
    createBooleanState(false);

  const [answerIconIsHidden$, { toggle: toggleAnswerIconIsHidden }] =
    createBooleanState(false);

  const [dateStringIsMinimized$, { toggle: toggleDateStringIsMinimized }] =
    createBooleanState(false);

  const [detailedFilterIsOpen$, { toggle: toggleDetailedFilter }] =
    createBooleanState(false);

  return {
    tableBodyValuesFiltered$,
    detailedFilterIsOpen$,
    dateStringIsMinimized$,
    answerIconIsHidden$,
    tableIsMinimized$,
    toggleDetailedFilter,
    toggleDateStringIsMinimized,
    toggleAnswerIconIsHidden,
    toggleTableIsMinimized,
  } as const;
};

export type AnswerTable = Readonly<{
  /** The table's rows, as sorted, without those the filters leave out. */
  tableBodyValuesFiltered$: InitializedObservable<
    DeepReadonly<
      {
        key: string;
        datetimeRange: DatetimeRange;
        score: number;
        answerSummaryRow: FixedLengthTuple<3, number> | undefined;
        answerTableRow: AnswerTableCell[] | undefined;
        /** The row's background, by its score. */
        backgroundColor: string | undefined;
      }[]
    >
  >;
  detailedFilterIsOpen$: InitializedObservable<boolean>;
  dateStringIsMinimized$: InitializedObservable<boolean>;
  answerIconIsHidden$: InitializedObservable<boolean>;
  tableIsMinimized$: InitializedObservable<boolean>;
  toggleDetailedFilter: () => boolean;
  toggleDateStringIsMinimized: () => boolean;
  toggleAnswerIconIsHidden: () => boolean;
  toggleTableIsMinimized: () => boolean;
}>;
