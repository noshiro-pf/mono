import type { AnswerTableCellPosition } from '../../types';
import { answerSelectionFromMapKey, answerSelectionToMapKey } from '../map-key';

export const createAnswerSelectionMapFromAnswers = (
  answers: readonly Answer[]
): IMapMapped<
  AnswerTableCellPosition,
  readonly [AnswerIconIdWithNone, AnswerIconPoint],
  AnswerSelectionMapKey
> =>
  IMapMapped.new(
    IList.flatMap(answers, ({ id, selection }) =>
      selection.map((s) => [
        {
          datetimeRange: s.datetimeRange,
          answerId: id,
        },
        tp(s.iconId, s.point),
      ])
    ),
    answerSelectionToMapKey,
    answerSelectionFromMapKey
  );
