import type {
  Answer,
  AnswerSymbol,
  AnswerSymbolIconId,
  AnswerSymbolPointEnumType,
  DatetimeRange,
  Weight,
} from '@noshiro/event-schedule-app-shared';
import { IList, IMap, IMapMapped, ituple, pipe } from '@noshiro/ts-utils';
import { answerSymbolPointConfig } from '../../constants';
import type { DatetimeRangeMapKey } from '../map-key';
import { datetimeRangeFromMapKey, datetimeRangeToMapKey } from '../map-key';

export const createAnswerSummary = (
  datetimeRangeList: readonly DatetimeRange[],
  answerSymbolList: readonly AnswerSymbol[],
  answerTable: IMapMapped<
    DatetimeRange,
    readonly (AnswerSymbolIconId | undefined)[],
    DatetimeRangeMapKey
  >
): IMapMapped<DatetimeRange, readonly number[], DatetimeRangeMapKey> =>
  IMapMapped.new(
    datetimeRangeList.map((datetimeRange) => {
      const answersForThisDatetimeRange:
        | readonly (AnswerSymbolIconId | undefined)[]
        | undefined = answerTable.get(datetimeRange);

      if (answersForThisDatetimeRange === undefined) {
        return [datetimeRange, answerSymbolList.map(() => 0)];
      }

      const answerGroups: IMap<AnswerSymbolIconId | undefined, number> = pipe(
        answersForThisDatetimeRange
      )
        .chain((list) => IList.groupBy(list, (x) => x))
        .chain((groups) => groups.map((v) => v.length)).value;

      return ituple(
        datetimeRange,
        IList.map(
          answerSymbolList,
          (answerSymbol) => answerGroups.get(answerSymbol.iconId) ?? 0
        )
      );
    }),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey
  );

const calcScoreSum = (
  symbolToScoreMap: IMap<AnswerSymbolIconId, AnswerSymbolPointEnumType>,
  answerSymbolList: readonly (AnswerSymbolIconId | undefined)[],
  answerWeightList: readonly Weight[],
  isRequiredParticipantsList: readonly boolean[]
): number => {
  const scores = answerSymbolList.map((symbolId) =>
    symbolId === undefined ? 0 : symbolToScoreMap.get(symbolId) ?? 0
  );

  const someRequiredParticipantsScoreIs0: boolean = pipe(
    IList.zip(isRequiredParticipantsList, scores)
  ).chain((list) =>
    list.some(([required, score]) => required && score === 0)
  ).value;

  return someRequiredParticipantsScoreIs0
    ? 0
    : pipe(IList.zip(scores, answerWeightList))
        .chain((list) => IList.map(list, ([score, weight]) => score * weight))
        .chain(IList.sum).value;
};

const calcScoreSumMax = (answerWeightList: readonly Weight[]): number =>
  IList.sum(answerWeightList.map((w) => w * answerSymbolPointConfig.max));

export const createScore = (
  datetimeRangeList: readonly DatetimeRange[],
  symbolList: readonly AnswerSymbol[],
  answerSummary: IMapMapped<
    DatetimeRange,
    readonly number[],
    DatetimeRangeMapKey
  >,
  answerTable: IMapMapped<
    DatetimeRange,
    readonly (AnswerSymbolIconId | undefined)[],
    DatetimeRangeMapKey
  >,
  answers: readonly Answer[]
): IMapMapped<DatetimeRange, number, DatetimeRangeMapKey> => {
  const symbolToScoreMap = IMap.new<
    AnswerSymbolIconId,
    AnswerSymbolPointEnumType
  >(symbolList.map((s) => [s.iconId, s.point]));

  return IMapMapped.new(
    datetimeRangeList.map((datetimeRange) => {
      const summaryForThisDatetimeRange: readonly number[] | undefined =
        answerSummary.get(datetimeRange);

      const answerSymbols = answerTable.get(datetimeRange);

      if (
        summaryForThisDatetimeRange === undefined ||
        answerSymbols === undefined
      ) {
        return [datetimeRange, 0];
      }

      const weightList = answers.map((a) => a.weight);
      const isRequiredParticipantsList = answers.map(
        (a) => a.isRequiredParticipants
      );

      const scoreSum: number = calcScoreSum(
        symbolToScoreMap,
        answerSymbols,
        weightList,
        isRequiredParticipantsList
      );
      const scoreMax: number = calcScoreSumMax(weightList);

      return [datetimeRange, answers.length === 0 ? 0 : scoreSum / scoreMax];
    }),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey
  );
};
