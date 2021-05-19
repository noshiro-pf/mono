import { useCallback, useMemo } from 'react';
import type {
  AnswerId,
  AnswerSymbolIconId,
  IAnswer,
  IDatetimeRange,
  IEventSchedule,
} from '../../../types';
import type { IList, IMap } from '../../../utils';
import { createAnswerSelectionMapFromAnswers } from './create-answer-selection-map-from-answers';
import { createAnswerTable } from './create-answer-table';
import type { IAnswerSelectionMapKey } from './map-key';
import { createAnswerSelectionMapKey } from './map-key';

export const useAnswerTable = (
  eventSchedule: IEventSchedule,
  answers: IList<IAnswer>
): IMap<IDatetimeRange, IList<AnswerSymbolIconId | undefined>> => {
  const answerSelectionMap = useMemo<
    IMap<IAnswerSelectionMapKey, AnswerSymbolIconId | undefined>
  >(() => createAnswerSelectionMapFromAnswers(answers), [answers]);

  const answerSelectionMapFn = useCallback(
    (
      datetimeRange: IDatetimeRange,
      answerId: AnswerId
    ): AnswerSymbolIconId | undefined =>
      answerSelectionMap.get(
        createAnswerSelectionMapKey({ datetimeRange, answerId })
      ),
    [answerSelectionMap]
  );

  const answerTable = useMemo<
    IMap<IDatetimeRange, IList<AnswerSymbolIconId | undefined>>
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
