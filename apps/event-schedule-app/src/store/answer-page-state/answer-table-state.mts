import { UserName } from 'event-schedule-app-shared';
import { type InitializedObservable, combine, map } from 'synstate';
import { createBooleanState } from 'synstate-react-hooks';
import {
  Arr,
  IMapMapped,
  Num,
  Optional,
  expectType,
  ifThen,
  pipe,
  tp,
} from 'ts-data-forge';
import { compareYearMonthDate } from 'ts-fortress-types';
import { type DeepReadonly, type FixedLengthTuple } from 'ts-type-forge';
import { answerTableColor, datetimeRange2str } from '../../constants/index.mjs';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerSummary,
  createAnswerTable,
  createScore,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../../functions/index.mjs';
import {
  type AnswerTableCell,
  type AnswerTableCellPosition,
} from '../../types/index.mjs';
import { mapOptional, match } from '../../utils-ported/index.mjs';
import { ymd2day } from '../../utils/index.mjs';
import { eventSchedule$ } from '../fetching-state/index.mjs';
import {
  AnswerFilterAndSortStore,
  answersFiltered$,
} from './answer-filter-sort-state.mjs';

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
> = answersFiltered$.pipe(
  map((answers) => mapOptional(answers, createAnswerSelectionMapFromAnswers)),
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
        mapOptional(answerSelectionMap, (__m) =>
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
> = combine([eventSchedule$, answerSelectionMapFn$, answersFiltered$]).pipe(
  map(([eventSchedule, answerSelectionMapFn, answers]) =>
    eventSchedule === undefined || answers === undefined
      ? undefined
      : createAnswerTable(
          answerSelectionMapFn,
          eventSchedule.datetimeRangeList,
          answers,
        ),
  ),
);

// sum of (good, fair, poor)
const answerSummary$: InitializedObservable<
  | IMapMapped<DatetimeRange, FixedLengthTuple<3, number>, DatetimeRangeMapKey>
  | undefined
> = combine([eventSchedule$, answerTable$]).pipe(
  map(([eventSchedule, answerTable]) =>
    eventSchedule === undefined || answerTable === undefined
      ? undefined
      : createAnswerSummary(eventSchedule.datetimeRangeList, answerTable),
  ),
);

const scores$: InitializedObservable<
  IMapMapped<DatetimeRange, number, DatetimeRangeMapKey> | undefined
> = combine([
  eventSchedule$,
  answerSummary$,
  answerTable$,
  answersFiltered$,
]).pipe(
  map(([eventSchedule, answerSummary, answerTable, answers]) =>
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
  ),
);

const datetimeRangeList$ = eventSchedule$.pipe(
  map((eventSchedule) => eventSchedule?.datetimeRangeList),
);

const datetimeRangeListReversed$ = eventSchedule$.pipe(
  map((eventSchedule) => eventSchedule?.datetimeRangeList.toReversed()),
);

const datetimeRangeListSortedByScores$ = combine([
  eventSchedule$,
  scores$,
]).pipe(
  map(([eventSchedule, scores]) =>
    eventSchedule === undefined || scores === undefined
      ? undefined
      : Arr.toSortedBy(
          eventSchedule.datetimeRangeList,
          (d) => Optional.toNullable(scores.get(d)) ?? 0,
        ),
  ),
);

const datetimeRangeListSortedByScoresReversed$ =
  datetimeRangeListSortedByScores$.pipe(
    map((datetimeRangeListSortedByScores) =>
      datetimeRangeListSortedByScores?.toReversed(),
    ),
  );

const datetimeRangeListReordered$ = combine([
  AnswerFilterAndSortStore.sortKeyAndOrder$,
  datetimeRangeList$,
  datetimeRangeListReversed$,
  datetimeRangeListSortedByScores$,
  datetimeRangeListSortedByScoresReversed$,
]).pipe(
  map(
    ([
      [sortKey, sortOrder],
      datetimeRangeList,
      datetimeRangeListReversed,
      datetimeRangeListSortedByScores,
      datetimeRangeListSortedByScoresReversed,
    ]) =>
      sortKey === 'date'
        ? sortOrder === 'asc'
          ? datetimeRangeList
          : datetimeRangeListReversed
        : sortOrder === 'asc'
          ? datetimeRangeListSortedByScores
          : datetimeRangeListSortedByScoresReversed,
  ),
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
        style: React.CSSProperties;
      }>,
      string
    >
  | undefined
> = combine([
  datetimeRangeList$,
  scores$,
  answerSummary$,
  answerTable$,
  eventSchedule$,
  answersFiltered$,
]).pipe(
  map(
    ([
      datetimeRangeList,
      scores,
      answerSummary,
      answerTable,
      eventSchedule,
      answers,
    ]) =>
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
                pipe(Optional.toNullable(answerTable.get(datetimeRange))).map(
                  (__v) =>
                    mapOptional(__v, (row) =>
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
                    ),
                ).value;

              const value: DeepReadonly<{
                key: string;
                datetimeRange: DatetimeRange;
                score: number;
                answerSummaryRow: FixedLengthTuple<3, number> | undefined;
                answerTableRow: AnswerTableCell[] | undefined;
                style: React.CSSProperties;
              }> = {
                key: datetimeRange2str(datetimeRange),
                datetimeRange,
                score,
                answerSummaryRow: Optional.toNullable(
                  answerSummary.get(datetimeRange),
                ),
                answerTableRow,
                style: {
                  backgroundColor:
                    score === 1
                      ? answerTableColor.perfectColor
                      : score >= answerTableColor.goodThreshold
                        ? answerTableColor.goodColor
                        : undefined,
                },
              } as const;

              return tp(datetimeRange, value);
            }),
            datetimeRangeToMapKey,
            datetimeRangeFromMapKey,
          ),
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
      style: React.CSSProperties;
    }[]
  >
> = combine([
  datetimeRangeListReordered$,
  datetimeRangeToTableRowValuesMap$,
]).pipe(
  map(([datetimeRangeListReordered, datetimeRangeToTableRowValuesMap]) =>
    datetimeRangeListReordered === undefined ||
    datetimeRangeToTableRowValuesMap === undefined
      ? []
      : datetimeRangeListReordered.map((datetimeRange) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Optional.toNullable(
            datetimeRangeToTableRowValuesMap.get(datetimeRange),
          )!,
        ),
  ),
);

const tableBodyValuesFiltered$ = combine([
  tableBodyValues$,
  AnswerFilterAndSortStore.filterState$,
  answersFiltered$,
]).pipe(
  map(([tableBodyValues, filterState, answers]) => {
    const tableBodyValuesFiltered = tableBodyValues.filter((row) => {
      const { answerTableRow, answerSummaryRow, score, datetimeRange } = row;

      if (answerSummaryRow === undefined || answerTableRow === undefined)
        return false;

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
        match(day, {
          0: Sun,
          1: Mon,
          2: Tue,
          3: Wed,
          4: Thr,
          5: Fri,
          6: Sat,
        }) &&
        // 日程範囲で絞り込み
        (dateStart === undefined ||
          compareYearMonthDate(dateStart, datetimeRange.ymd) <= 0) &&
        (dateEnd === undefined ||
          compareYearMonthDate(datetimeRange.ymd, dateEnd) <= 0)
      );
    });

    if (!filterState.rank.enabled) return tableBodyValuesFiltered;

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
  }),
);

const [useTableIsMinimized, { toggle: toggleTableIsMinimized }] =
  createBooleanState(false);

const [useAnswerIconIsHidden, { toggle: toggleAnswerIconIsHidden }] =
  createBooleanState(false);

const [useDateStringIsMinimized, { toggle: toggleDateStringIsMinimized }] =
  createBooleanState(false);

const [useDetailedFilterIsOpen, { toggle: toggleDetailedFilter }] =
  createBooleanState(false);

export const AnswerTableStore = {
  tableBodyValuesFiltered$,
  useDetailedFilterIsOpen,
  toggleDetailedFilter,
  useDateStringIsMinimized,
  toggleDateStringIsMinimized,
  useAnswerIconIsHidden,
  toggleAnswerIconIsHidden,
  useTableIsMinimized,
  toggleTableIsMinimized,
} as const;
