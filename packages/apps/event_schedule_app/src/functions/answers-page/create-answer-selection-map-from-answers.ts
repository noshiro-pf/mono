import type {
  Answer,
  AnswerSymbolIdWithNone,
  AnswerSymbolPoint,
  AnswerTableCellPosition,
} from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped, ituple } from '@noshiro/ts-utils';
import type { AnswerSelectionMapKey } from '../map-key';
import { answerSelectionFromMapKey, answerSelectionToMapKey } from '../map-key';

export const createAnswerSelectionMapFromAnswers = (
  answers: readonly Answer[]
): IMapMapped<
  AnswerTableCellPosition,
  readonly [AnswerSymbolIdWithNone, AnswerSymbolPoint],
  AnswerSelectionMapKey
> =>
  IMapMapped.new(
    IList.flatMap(answers, ({ id, selection }) =>
      selection.map((s) => [
        {
          datetimeRange: s.datetimeRange,
          answerId: id,
        },
        ituple(s.iconId, s.point),
      ])
    ),
    answerSelectionToMapKey,
    answerSelectionFromMapKey
  );
