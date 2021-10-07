import type {
  Answer,
  AnswerSymbolIconId,
  AnswerTableCellPosition,
} from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped } from '@noshiro/ts-utils';
import type { AnswerSelectionMapKey } from '../map-key';
import { answerSelectionFromMapKey, answerSelectionToMapKey } from '../map-key';

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
