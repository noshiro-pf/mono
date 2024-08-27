import { compareYmd, toUserName } from '@noshiro/event-schedule-app-shared';
import { answerTableColor, datetimeRange2str } from '../../constants';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerSummary,
  createAnswerTable,
  createScore,
} from '../../functions';
import {
  type AnswerTableCell,
  type AnswerTableCellPosition,
} from '../../types';
import { ymd2day } from '../../utils';
import { eventSchedule$ } from '../fetching-state';
import {
  AnswerFilterAndSortStore,
  answersFiltered$,
} from './answer-filter-sort-state';

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
> = answersFiltered$.chain(
  map((answers) => mapOptional(answers, createAnswerSelectionMapFromAnswers)),
);

const answerSelectionMapFn$ = answerSelectionMap$.chain(
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
        answerSelectionMap?.get({ datetimeRange, answerId }) ??
        tp('none', 0, ''),
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
> = combine([eventSchedule$, answerSelectionMapFn$, answersFiltered$]).chain(
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
  | IMapMapped<DatetimeRange, ArrayOfLength<3, number>, DatetimeRangeMapKey>
  | undefined
> = combine([eventSchedule$, answerTable$]).chain(
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
]).chain(
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

const datetimeRangeList$ = eventSchedule$.chain(
  map((eventSchedule) => eventSchedule?.datetimeRangeList),
);

const datetimeRangeListReversed$ = eventSchedule$.chain(
  map((eventSchedule) => eventSchedule?.datetimeRangeList.toReversed()),
);

const datetimeRangeListSortedByScores$ = combine([
  eventSchedule$,
  scores$,
]).chain(
  map(([eventSchedule, scores]) =>
    eventSchedule === undefined || scores === undefined
      ? undefined
      : Arr.sortedBy(
          eventSchedule.datetimeRangeList,
          (d) => scores.get(d) ?? 0,
        ),
  ),
);

const datetimeRangeListSortedByScoresReversed$ =
  datetimeRangeListSortedByScores$.chain(
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
]).chain(
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
  | IMap<
      DatetimeRange,
      DeepReadonly<{
        key: string;
        datetimeRange: DatetimeRange;
        score: number;
        answerSummaryRow: ArrayOfLength<3, number> | undefined;
        answerTableRow: AnswerTableCell[] | undefined;
        style: React.CSSProperties;
      }>
    >
  | undefined
> = combine([
  datetimeRangeList$,
  scores$,
  answerSummary$,
  answerTable$,
  eventSchedule$,
  answersFiltered$,
]).chain(
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
        : IMap.new(
            datetimeRangeList.map((datetimeRange) => {
              const score = scores.get(datetimeRange) ?? 0;

              const answerTableRow: readonly AnswerTableCell[] | undefined =
                pipe(answerTable.get(datetimeRange)).chainOptional((row) =>
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
                answerSummaryRow: ArrayOfLength<3, number> | undefined;
                answerTableRow: AnswerTableCell[] | undefined;
                style: React.CSSProperties;
              }> = {
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
              } as const;

              return tp(datetimeRange, value);
            }),
          ),
  ),
);

const tableBodyValues$: InitializedObservable<
  DeepReadonly<
    {
      key: string;
      datetimeRange: DatetimeRange;
      score: number;
      answerSummaryRow: ArrayOfLength<3, number> | undefined;
      answerTableRow: AnswerTableCell[] | undefined;
      style: React.CSSProperties;
    }[]
  >
> = combine([
  datetimeRangeListReordered$,
  datetimeRangeToTableRowValuesMap$,
]).chain(
  map(([datetimeRangeListReordered, datetimeRangeToTableRowValuesMap]) =>
    datetimeRangeListReordered === undefined ||
    datetimeRangeToTableRowValuesMap === undefined
      ? []
      : datetimeRangeListReordered.map(
          (datetimeRange) =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            datetimeRangeToTableRowValuesMap.get(datetimeRange)!,
        ),
  ),
);

const tableBodyValuesFiltered$ = combine([
  tableBodyValues$,
  AnswerFilterAndSortStore.filterState$,
  answersFiltered$,
]).chain(
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
        dayOfWeek: {
          value: { Sun, Mon, Tue, Wed, Thr, Fri, Sat },
        },
        dateRange: {
          value: { start: dateStart, end: dateEnd },
        },
        ..._rest
      } = filterState;

      expectType<keyof typeof _rest, 'rank' | 'respondent'>('=');

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
              answers?.[index]?.user.name ?? toUserName(''),
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
          compareYmd(dateStart, datetimeRange.ymd) <= 0) &&
        (dateEnd === undefined || compareYmd(datetimeRange.ymd, dateEnd) <= 0)
      );
    });

    if (!filterState.rank.enabled) return tableBodyValuesFiltered;

    const scoreThreshold = pipe(tableBodyValuesFiltered)
      .chain((ar) => ar.map((a) => a.score))
      .chain(
        (ar) => ar.toSorted((a, b) => b - a)[filterState.rank.value - 1],
      ).value;

    return tableBodyValuesFiltered.filter(
      (row) =>
        // スコア上位のみ表示
        scoreThreshold === undefined || row.score >= scoreThreshold,
    );
  }),
);

const { state: tableIsMinimized$, toggle: toggleTableIsMinimized } =
  createBooleanState(false);

const { state: answerIconIsHidden$, toggle: toggleAnswerIconIsHidden } =
  createBooleanState(false);

const { state: dateStringIsMinimized$, toggle: toggleDateStringIsMinimized } =
  createBooleanState(false);

const { state: detailedFilterIsOpen$, toggle: toggleDetailedFilter } =
  createBooleanState(false);

export const AnswerTableStore = {
  tableBodyValuesFiltered$,
  detailedFilterIsOpen$,
  toggleDetailedFilter,
  dateStringIsMinimized$,
  toggleDateStringIsMinimized,
  answerIconIsHidden$,
  toggleAnswerIconIsHidden,
  tableIsMinimized$,
  toggleTableIsMinimized,
} as const;
