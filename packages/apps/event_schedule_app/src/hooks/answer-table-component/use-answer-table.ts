import type {
  Answer,
  AnswerIconIdWithNone,
  AnswerIconPoint,
  AnswerId,
  DatetimeRange,
  EventSchedule,
} from '@noshiro/event-schedule-app-shared';
import { useCallback, useMemo } from 'react';
import type {
  AnswerSelectionMapKey,
  DatetimeRangeMapKey,
} from '../../functions';
import {
  createAnswerSelectionMapFromAnswers,
  createAnswerTable,
} from '../../functions';
import type { AnswerTableCellPosition } from '../../types';

export const useAnswerTable = (
  eventSchedule: EventSchedule,
  answers: readonly Answer[]
): IMapMapped<
  DatetimeRange,
  DeepReadonly<[AnswerIconIdWithNone, AnswerIconPoint][]>,
  DatetimeRangeMapKey
> => {
  const answerSelectionMap = useMemo<
    IMapMapped<
      AnswerTableCellPosition,
      readonly [AnswerIconIdWithNone, AnswerIconPoint],
      AnswerSelectionMapKey
    >
  >(() => createAnswerSelectionMapFromAnswers(answers), [answers]);

  const answerSelectionMapFn = useCallback(
    (
      datetimeRange: DatetimeRange,
      answerId: AnswerId
    ): readonly [AnswerIconIdWithNone, AnswerIconPoint] =>
      answerSelectionMap.get({ datetimeRange, answerId }) ?? tp('none', 0),
    [answerSelectionMap]
  );

  const answerTable = useMemo<
    IMapMapped<
      DatetimeRange,
      DeepReadonly<[AnswerIconIdWithNone, AnswerIconPoint][]>,
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
