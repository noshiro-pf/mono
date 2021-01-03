import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { AnswerId } from '../../../types/phantom';
import { IAnswer } from '../../../types/record/answer';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IList, IMap } from '../../../utils/immutable';

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
