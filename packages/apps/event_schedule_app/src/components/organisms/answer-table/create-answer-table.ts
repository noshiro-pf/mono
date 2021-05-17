import type { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import type { AnswerId } from '../../../types/phantom';
import type { IAnswer } from '../../../types/record/answer';
import type { IDatetimeRange } from '../../../types/record/datetime-range';
import type { IList } from '../../../utils/immutable';
import { IMap } from '../../../utils/immutable';

export const createAnswerTable = (
  answerSelectionMapFn: (
    datetimeRange: IDatetimeRange,
    answerId: AnswerId
  ) => AnswerSymbolIconId | undefined,
  datetimeRangeList: IList<IDatetimeRange>,
  answers: IList<IAnswer>
): IMap<IDatetimeRange, IList<AnswerSymbolIconId | undefined>> =>
  IMap(
    datetimeRangeList.map((datetimeRange) => [
      datetimeRange,
      answers.map((answer) => answerSelectionMapFn(datetimeRange, answer.id)),
    ])
  );
