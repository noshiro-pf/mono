import type {
  AnswerId,
  AnswerSymbolIconId,
  IAnswer,
  IDatetimeRange,
} from '../../../types';
import type { IList } from '../../../utils';
import { IMap } from '../../../utils';

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
