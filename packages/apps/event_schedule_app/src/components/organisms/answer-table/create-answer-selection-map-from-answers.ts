import type {
  Answer,
  AnswerSymbolIconId,
  AnswerTableCellPosition,
} from '@noshiro/event-schedule-app-api';
import { IList, IMapMapped } from '@noshiro/ts-utils';
import type { AnswerSelectionMapKey } from '../../../functions';
import {
  answerSelectionFromMapKey,
  answerSelectionToMapKey,
} from '../../../functions';

export const createAnswerSelectionMapFromAnswers = (
  answers: readonly Answer[]
): IMapMapped<
  AnswerTableCellPosition,
  AnswerSymbolIconId | undefined,
  AnswerSelectionMapKey
> =>
  IMapMapped.new(
    IList.flatMap(answers, ({ id, selection }) =>
      selection.map((s) => [
        {
          datetimeRange: s.datetimeRange,
          answerId: id,
        },
        s.iconId,
      ])
    ),
    answerSelectionToMapKey,
    answerSelectionFromMapKey
  );
