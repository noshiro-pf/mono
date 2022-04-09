import type {
  AnswerIconIdWithNone,
  AnswerIconPoint,
  AnswerId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import { answerTableColor } from '../../constants';
import type {
  AnswerSelectionMapKey,
  DatetimeRangeMapKey,
} from '../../functions';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerSummary,
  createAnswerTable,
  createScore,
  datetimeRange2str,
} from '../../functions';
import type { AnswerTableCell, AnswerTableCellPosition } from '../../types';
import { answers$, eventSchedule$ } from '../fetched-values-state';

const answerSelectionMap$: InitializedObservable<
  | IMapMapped<
      AnswerTableCellPosition,
      readonly [AnswerIconIdWithNone, AnswerIconPoint],
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
      ): readonly [AnswerIconIdWithNone, AnswerIconPoint] =>
        answerSelectionMap?.get({ datetimeRange, answerId }) ?? tp('none', 0)
  )
);

const answerTable$: InitializedObservable<
  | IMapMapped<
      DatetimeRange,
      DeepReadonly<[AnswerIconIdWithNone, AnswerIconPoint][]>,
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
  IMapMapped<DatetimeRange, readonly number[], DatetimeRangeMapKey> | undefined
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

const { state$: sortKeyAndOrder$, setState: setSortOrderAndKey } = createState<
  readonly ['date' | 'score', 'asc' | 'desc']
>(['date', 'asc']);

export const onDatetimeSortChange = (state: 'asc' | 'desc'): void => {
  setSortOrderAndKey(['date', state]);
};

export const onScoreSortChange = (state: 'asc' | 'desc'): void => {
  setSortOrderAndKey(['score', state]);
};

const datetimeRangeListReordered$ = combineLatestI([
  sortKeyAndOrder$,

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

export const tableBodyValues$: InitializedObservable<
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
> = combineLatestI([
  datetimeRangeListReordered$,
  scores$,
  answerSummary$,
  answerTable$,
  eventSchedule$,
  answers$,
]).chain(
  mapI(
    ([
      datetimeRangeListReordered,
      scores,
      answerSummary,
      answerTable,
      eventSchedule,
      answers,
    ]) =>
      datetimeRangeListReordered === undefined ||
      scores === undefined ||
      answerSummary === undefined ||
      answerTable === undefined ||
      eventSchedule === undefined ||
      answers === undefined
        ? []
        : datetimeRangeListReordered.map((datetimeRange) => {
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
          })
  )
);
