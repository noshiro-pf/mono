import type { AnswerSymbolIconId, IAnswer } from '../../../types';
import type { IList } from '../../../utils';
import { IMap } from '../../../utils';
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
