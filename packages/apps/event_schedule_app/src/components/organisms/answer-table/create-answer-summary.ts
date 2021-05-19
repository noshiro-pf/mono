import { answerSymbolPointConfig } from '../../../constants';
import type {
  AnswerSymbolIconId,
  IAnswerSymbol,
  IDatetimeRange,
} from '../../../types';
import type { IList } from '../../../utils';
import { IMap } from '../../../utils';

export const createAnswerSummary = (
  datetimeRangeList: IList<IDatetimeRange>,
  answerSymbolList: IList<IAnswerSymbol>,
  answerTable: IMap<IDatetimeRange, IList<AnswerSymbolIconId | undefined>>
): IMap<IDatetimeRange, IList<number>> =>
  IMap(
    datetimeRangeList.map((datetimeRange) => {
      const answersForThisDatetimeRange:
        | IList<AnswerSymbolIconId | undefined>
        | undefined = answerTable.get(datetimeRange);

      if (answersForThisDatetimeRange === undefined) {
        return [datetimeRange, answerSymbolList.map(() => 0)];
      }

      const answerGroups: IMap<AnswerSymbolIconId | undefined, number> =
        answersForThisDatetimeRange
          .groupBy((x) => x)
          .map((v) => v.count())
          .toMap();

      return [
        datetimeRange,
        answerSymbolList.map(
          (answerSymbol) => answerGroups.get(answerSymbol.iconId) ?? 0
        ),
      ];
    })
  );

export const createScore = (
  datetimeRangeList: IList<IDatetimeRange>,
  answerSymbolList: IList<IAnswerSymbol>,
  answerSummary: IMap<IDatetimeRange, IList<number>>,
  numAnswers: number
): IMap<IDatetimeRange, number> =>
  IMap(
    datetimeRangeList.map((datetimeRange) => {
      const summaryForThisDatetimeRange: IList<number> | undefined =
        answerSummary.get(datetimeRange);

      if (summaryForThisDatetimeRange === undefined) {
        return [datetimeRange, 0];
      }

      const scoreSum: number = answerSymbolList
        .zip(summaryForThisDatetimeRange)
        .reduce((sum, [symbol, summary]) => sum + symbol.point * summary, 0);

      return [
        datetimeRange,
        numAnswers === 0
          ? 0
          : scoreSum / (numAnswers * answerSymbolPointConfig.max),
      ];
    })
  );
