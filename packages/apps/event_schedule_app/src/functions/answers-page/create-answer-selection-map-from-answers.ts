import type {
  Answer,
  AnswerIconIdWithNone,
  AnswerIconPoint,
} from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped, tp } from '@noshiro/ts-utils';
import type { AnswerTableCellPosition } from '../../types';
import type { AnswerSelectionMapKey } from '../map-key';
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
