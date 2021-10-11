import type {
  Answer,
  AnswerId,
  AnswerSymbolIdWithNone,
  AnswerSymbolPoint,
  AnswerTableCellPosition,
  DatetimeRange,
  EventSchedule,
} from '@noshiro/event-schedule-app-shared';
import type { IMapMapped } from '@noshiro/ts-utils';
import { ituple } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import type {
  AnswerSelectionMapKey,
  DatetimeRangeMapKey,
} from '../../functions';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerTable,
} from '../../functions';

export const useAnswerTable = (
  eventSchedule: EventSchedule,
  answers: readonly Answer[]
): IMapMapped<
  DatetimeRange,
  DeepReadonly<[AnswerSymbolIdWithNone, AnswerSymbolPoint][]>,
  DatetimeRangeMapKey
> => {
  const answerSelectionMap = useMemo<
    IMapMapped<
      AnswerTableCellPosition,
      readonly [AnswerSymbolIdWithNone, AnswerSymbolPoint],
      AnswerSelectionMapKey
    >
  >(() => createAnswerSelectionMapFromAnswers(answers), [answers]);

  const answerSelectionMapFn = useCallback(
    (
      datetimeRange: DatetimeRange,
      answerId: AnswerId
    ): readonly [AnswerSymbolIdWithNone, AnswerSymbolPoint] =>
      answerSelectionMap.get({ datetimeRange, answerId }) ?? ituple('none', 0),
    [answerSelectionMap]
  );

  const answerTable = useMemo<
    IMapMapped<
      DatetimeRange,
      DeepReadonly<[AnswerSymbolIdWithNone, AnswerSymbolPoint][]>,
      DatetimeRangeMapKey
    >
  >(
    () =>
      createAnswerTable(
        answerSelectionMapFn,
        eventSchedule.datetimeRangeList,
        answers
      ),
    [answerSelectionMapFn, answers, eventSchedule.datetimeRangeList]
  );

  return answerTable;
};
