import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { IAnswer } from '../../../types/record/answer';
import { IList, IMap } from '../../../utils/immutable';
import { createAnswerSelectionMapKey, IAnswerSelectionMapKey } from './map-key';

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
