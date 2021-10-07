import type {
  Answer,
  AnswerId,
  AnswerSymbolIconId,
  AnswerTableCellPosition,
  DatetimeRange,
  EventSchedule,
} from '@noshiro/event-schedule-app-shared';
import type { IMapMapped } from '@noshiro/ts-utils';
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
  readonly (AnswerSymbolIconId | undefined)[],
  DatetimeRangeMapKey
> => {
  const answerSelectionMap = useMemo<
    IMapMapped<
      AnswerTableCellPosition,
      AnswerSymbolIconId | undefined,
      AnswerSelectionMapKey
    >
  >(() => createAnswerSelectionMapFromAnswers(answers), [answers]);

  const answerSelectionMapFn = useCallback(
    (
      datetimeRange: DatetimeRange,
      answerId: AnswerId
    ): AnswerSymbolIconId | undefined =>
      answerSelectionMap.get({ datetimeRange, answerId }),
    [answerSelectionMap]
  );

  const answerTable = useMemo<
    IMapMapped<
      DatetimeRange,
      readonly (AnswerSymbolIconId | undefined)[],
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
