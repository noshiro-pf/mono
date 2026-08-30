import { Arr, IMapMapped, tp } from 'ts-data-forge';
import { type AnswerTableCellPosition } from '../../types/index.mjs';
import {
  answerSelectionFromMapKey,
  answerSelectionToMapKey,
} from '../map-key/index.mjs';

export const createAnswerSelectionMapFromAnswers = (
  answers: readonly Answer[],
): IMapMapped<
  AnswerTableCellPosition,
  readonly [
    iconId: AnswerIconIdWithNone,
    point: AnswerIconPoint,
    comment: string,
  ],
  AnswerSelectionMapKey
> =>
  IMapMapped.create(
    Arr.flatMap(answers, ({ id, selection }) =>
      selection.map((s) => [
        { datetimeRange: s.datetimeRange, answerId: id },
        tp(s.iconId, s.point, s.comment),
      ]),
    ),
    answerSelectionToMapKey,
    answerSelectionFromMapKey,
  );
