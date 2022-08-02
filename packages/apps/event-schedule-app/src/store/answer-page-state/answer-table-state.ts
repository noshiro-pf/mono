import { compareYmd } from '@noshiro/event-schedule-app-shared';
import { answerTableColor, datetimeRange2str } from '../../constants';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerSummary,
  createAnswerTable,
  createScore,
} from '../../functions';
import type { AnswerTableCell, AnswerTableCellPosition } from '../../types';
import { ymd2day } from '../../utils';
import { answers$, eventSchedule$ } from '../fetching-state';
import { AnswerFilterAndSortStore } from './answer-filter-sort-state';

export namespace AnswerTableStore {
  const answerSelectionMap$: InitializedObservable<
    | IMapMapped<
        AnswerTableCellPosition,
        readonly [
          iconId: AnswerIconIdWithNone,
          point: AnswerIconPoint,
          comment: string
        ],
        AnswerSelectionMapKey
      >
    | undefined
  > = answers$.chain(
    mapI((answers) => mapNullable(answers, createAnswerSelectionMapFromAnswers))
  );

  const answerSelectionMapFn$ = answerSelectionMap$.chain(
    mapI(
      (answerSelectionMap) =>
        (
          datetimeRange: DatetimeRange,
          answerId: AnswerId
        ): readonly [
          iconId: AnswerIconIdWithNone,
          point: AnswerIconPoint,
          comment: string
        ] =>
          answerSelectionMap?.get({ datetimeRange, answerId }) ??
          tp('none', 0, '')
    )
  );

  const answerTable$: InitializedObservable<
    | IMapMapped<
        DatetimeRange,
        DeepReadonly<
          [
            iconId: AnswerIconIdWithNone,
            point: AnswerIconPoint,
            comment: string
          ][]
        >,
        DatetimeRangeMapKey
      >
    | undefined
  > = combineLatestI([eventSchedule$, answerSelectionMapFn$, answers$]).chain(
    mapI(([eventSchedule, answerSelectionMapFn, answers]) =>
      eventSchedule === undefined || answers === undefined
        ? undefined
        : createAnswerTable(
            answerSelectionMapFn,
            eventSchedule.datetimeRangeList,
            answers
          )
    )
  );

  // sum of (good, fair, poor)
  const answerSummary$: InitializedObservable<
    | IMapMapped<DatetimeRange, ArrayOfLength<3, number>, DatetimeRangeMapKey>
    | undefined
  > = combineLatestI([eventSchedule$, answerTable$]).chain(
    mapI(([eventSchedule, answerTable]) =>
      eventSchedule === undefined || answerTable === undefined
        ? undefined
        : createAnswerSummary(eventSchedule.datetimeRangeList, answerTable)
    )
  );

  const scores$: InitializedObservable<
    IMapMapped<DatetimeRange, number, DatetimeRangeMapKey> | undefined
  > = combineLatestI([
    eventSchedule$,
    answerSummary$,
    answerTable$,
    answers$,
  ]).chain(
    mapI(([eventSchedule, answerSummary, answerTable, answers]) =>
      eventSchedule === undefined ||
      answerSummary === undefined ||
      answerTable === undefined ||
      answers === undefined
        ? undefined
        : createScore(
            eventSchedule.datetimeRangeList,
            answerSummary,
            answerTable,
            answers
          )
    )
  );

  const datetimeRangeList$ = eventSchedule$.chain(
    mapI((eventSchedule) => eventSchedule?.datetimeRangeList)
  );

  const datetimeRangeListReversed$ = eventSchedule$.chain(
    mapI((eventSchedule) =>
      mapNullable(eventSchedule?.datetimeRangeList, IList.reverse)
    )
  );

  const datetimeRangeListSortedByScores$ = combineLatestI([
    eventSchedule$,
    scores$,
  ]).chain(
    mapI(([eventSchedule, scores]) =>
      eventSchedule === undefined || scores === undefined
        ? undefined
        : IList.sortBy(
            eventSchedule.datetimeRangeList,
            (d) => scores.get(d) ?? 0
          )
    )
  );

  const datetimeRangeListSortedByScoresReversed$ =
    datetimeRangeListSortedByScores$.chain(
      mapI((datetimeRangeListSortedByScores) =>
        mapNullable(datetimeRangeListSortedByScores, IList.reverse)
      )
    );

  const datetimeRangeListReordered$ = combineLatestI([
    AnswerFilterAndSortStore.sortKeyAndOrder$,

    datetimeRangeList$,
    datetimeRangeListReversed$,
    datetimeRangeListSortedByScores$,
    datetimeRangeListSortedByScoresReversed$,
  ]).chain(
    mapI(
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
          : datetimeRangeListSortedByScoresReversed
    )
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
          style: CSSProperties;
        }>
      >
    | undefined
  > = combineLatestI([
    datetimeRangeList$,
    scores$,
    answerSummary$,
    answerTable$,
    eventSchedule$,
    answers$,
  ]).chain(
    mapI(
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
                  pipe(answerTable.get(datetimeRange)).chain((list) =>
                    mapNullable(list, (row) =>
                      IList.zip(
                        row,
                        answers.map((a) => a.weight)
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
                      }))
                    )
                  ).value;

                const value: DeepReadonly<{
                  key: string;
                  datetimeRange: DatetimeRange;
                  score: number;
                  answerSummaryRow: ArrayOfLength<3, number> | undefined;
                  answerTableRow: AnswerTableCell[] | undefined;
                  style: CSSProperties;
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
              })
            )
    )
  );

  const tableBodyValues$: InitializedObservable<
    DeepReadonly<
      {
        key: string;
        datetimeRange: DatetimeRange;
        score: number;
        answerSummaryRow: ArrayOfLength<3, number> | undefined;
        answerTableRow: AnswerTableCell[] | undefined;
        style: CSSProperties;
      }[]
    >
  > = combineLatestI([
    datetimeRangeListReordered$,
    datetimeRangeToTableRowValuesMap$,
  ]).chain(
    mapI(([datetimeRangeListReordered, datetimeRangeToTableRowValuesMap]) =>
      datetimeRangeListReordered === undefined ||
      datetimeRangeToTableRowValuesMap === undefined
        ? []
        : datetimeRangeListReordered.map(
            (datetimeRange) =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              datetimeRangeToTableRowValuesMap.get(datetimeRange)!
          )
    )
  );

  export const tableBodyValuesFiltered$ = combineLatestI([
    tableBodyValues$,
    AnswerFilterAndSortStore.filterState$,
    answers$,
  ]).chain(
    mapI(([tableBodyValues, filterState, answers]) =>
      tableBodyValues.filter((row) => {
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
        } = filterState;

        const day = ymd2day(datetimeRange.ymd);

        return (
          // 記号個数で絞り込み
          Num.isInRange(goodBounds.min, goodBounds.max)(good) &&
          Num.isInRange(fairBounds.min, fairBounds.max)(fair) &&
          Num.isInRange(poorBounds.min, poorBounds.max)(poor) &&
          Num.isInRange(
            goodPlusFairBounds.min,
            goodPlusFairBounds.max
          )(good + fair) &&
          Num.isInRange(
            fairPlusPoorBounds.min,
            fairPlusPoorBounds.max
          )(fair + poor) &&
          // 全員回答済みの候補日のみ表示
          ifThen(filledDateOnly, good + fair + poor === numAnswers) &&
          // 指定した回答者の記号で絞り込み
          answerTableRow.every(
            (cell, index) =>
              !falseKeys.has([answers?.[index]?.user.name ?? '', cell.iconId])
          ) &&
          // スコアで絞り込み
          Num.isInRange(scoreRange.value.min, scoreRange.value.max)(score) &&
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
      })
    )
  );

  export const {
    state$: tableMinimized$,
    setTrue: minimizeTable,
    setFalse: maximizeTable,
  } = createBooleanState(false);

  export const { state$: detailedFilterIsOpen$, toggle: toggleDetailedFilter } =
    createBooleanState(false);
}
