import { type AnswerTableCellPosition } from '../../types';
import { answerSelectionFromMapKey, answerSelectionToMapKey } from '../map-key';

export const createAnswerSelectionMapFromAnswers = (
  answers: readonly Answer[]
): IMapMapped<
  AnswerTableCellPosition,
  readonly [
    iconId: AnswerIconIdWithNone,
    point: AnswerIconPoint,
    comment: string
  ],
  AnswerSelectionMapKey
> =>
  IMapMapped.new(
    Arr.flatMap(answers, ({ id, selection }) =>
      selection.map((s) => [
        {
          datetimeRange: s.datetimeRange,
          answerId: id,
        },
        tp(s.iconId, s.point, s.comment),
      ])
    ),
    answerSelectionToMapKey,
    answerSelectionFromMapKey
  );
