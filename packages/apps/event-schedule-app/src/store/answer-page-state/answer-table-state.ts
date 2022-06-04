import { answerTableColor } from '../../constants';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerSummary,
  createAnswerTable,
  createScore,
  datetimeRange2str,
} from '../../functions';
import type { AnswerTableCell, AnswerTableCellPosition } from '../../types';
import { answers$, eventSchedule$ } from '../fetch-state';
import { AnswerTableFilteringAndSortingManager } from './answer-table-filtering-state-manager';

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
      : IList.sortBy(eventSchedule.datetimeRangeList, (d) => scores.get(d) ?? 0)
  )
);

const datetimeRangeListSortedByScoresReversed$ =
  datetimeRangeListSortedByScores$.chain(
    mapI((datetimeRangeListSortedByScores) =>
      mapNullable(datetimeRangeListSortedByScores, IList.reverse)
    )
  );

const datetimeRangeListReordered$ = combineLatestI([
  AnswerTableFilteringAndSortingManager.sortKeyAndOrder$,

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

export const datetimeRangeToTableRowValuesMap$: InitializedObservable<
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

export const tableBodyValues$: InitializedObservable<
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
  AnswerTableFilteringAndSortingManager.answerTableFilteringState$,
]).chain(
  mapI(([tableBodyValues, answerTableFilteringState]) =>
    tableBodyValues.filter((row) => {
      if (row.answerSummaryRow === undefined) return false;
      const [good, fair, poor] = row.answerSummaryRow;
      const {
        good: goodBounds,
        fair: fairBounds,
        poor: poorBounds,
      } = answerTableFilteringState;

      return (
        Num.isInRange(goodBounds.min, goodBounds.max)(good) &&
        Num.isInRange(fairBounds.min, fairBounds.max)(fair) &&
        Num.isInRange(poorBounds.min, poorBounds.max)(poor)
      );
    })
  )
);
