import { useCallback, useMemo } from 'react';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { AnswerId } from '../../../types/phantom';
import { IAnswer } from '../../../types/record/answer';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { IList, IMap } from '../../../utils/immutable';
import { createAnswerSelectionMapFromAnswers } from './create-answer-selection-map-from-answers';
import { createAnswerTable } from './create-answer-table';
import { createAnswerSelectionMapKey, IAnswerSelectionMapKey } from './map-key';

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
