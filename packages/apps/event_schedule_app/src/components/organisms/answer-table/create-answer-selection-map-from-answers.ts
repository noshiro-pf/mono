import type { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import type { IAnswer } from '../../../types/record/answer';
import type { IList } from '../../../utils/immutable';
import { IMap } from '../../../utils/immutable';
import type { IAnswerSelectionMapKey } from './map-key';
import { createAnswerSelectionMapKey } from './map-key';

export const createAnswerSelectionMapFromAnswers = (
  answers: IList<IAnswer>
): IMap<IAnswerSelectionMapKey, AnswerSymbolIconId | undefined> =>
  IMap(
    answers.flatMap(({ id, selection }) =>
      selection.map((s) => [
        createAnswerSelectionMapKey({
          datetimeRange: s.datetimeRange,
          answerId: id,
        }),
        s.iconId,
      ])
    )
  );
