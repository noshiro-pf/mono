import { answerIconPointConfig } from '../../constants';
import { datetimeRangeFromMapKey, datetimeRangeToMapKey } from '../map-key';

export const createAnswerSummary = (
  datetimeRangeList: readonly DatetimeRange[],
  answerTable: IMapMapped<
    DatetimeRange,
    DeepReadonly<
      [iconId: AnswerIconIdWithNone, point: AnswerIconPoint, comment: string][]
    >,
    DatetimeRangeMapKey
  >
): IMapMapped<DatetimeRange, ArrayOfLength<3, number>, DatetimeRangeMapKey> =>
  IMapMapped.new(
    IList.map(datetimeRangeList, (datetimeRange) => {
      const answersForThisDatetimeRange:
        | DeepReadonly<
            [
              iconId: AnswerIconIdWithNone,
              point: AnswerIconPoint,
              comment: string
            ][]
          >
        | undefined = answerTable.get(datetimeRange);

      if (answersForThisDatetimeRange === undefined) {
        return tp(datetimeRange, tp(0, 0, 0));
      }

      const answerGroups: IMap<AnswerIconIdWithNone, number> = pipe(
        answersForThisDatetimeRange.map(([iconId, _point]) => iconId)
      )
        .chain((list) => IList.groupBy(list, (x) => x))
        .chain((groups) => groups.map((v) => v.length)).value;

      const counts = tp(
        answerGroups.get('good') ?? 0,
        answerGroups.get('fair') ?? 0,
        answerGroups.get('poor') ?? 0
      );

      return tp(datetimeRange, counts);
    }),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey
  );

const calcScoreSum = (
  answerPointList: readonly AnswerIconPoint[],
  answerWeightList: readonly Weight[],
  isRequiredParticipantsList: readonly boolean[]
): number => {
  const someRequiredParticipantsScoreIs0: boolean = pipe(
    IList.zip(isRequiredParticipantsList, answerPointList)
  ).chain((list) =>
    list.some(([required, score]) => required && score === 0)
  ).value;

  return someRequiredParticipantsScoreIs0
    ? 0
    : pipe(IList.zip(answerPointList, answerWeightList))
        .chain((list) => IList.map(list, ([score, weight]) => score * weight))
        .chain(IList.sum).value;
};

const calcScoreSumMax = (answerWeightList: readonly Weight[]): number =>
  IList.sum(answerWeightList.map((w) => w * answerIconPointConfig.max));

export const createScore = (
  datetimeRangeList: readonly DatetimeRange[],
  answerSummary: IMapMapped<
    DatetimeRange,
    ArrayOfLength<3, number>,
    DatetimeRangeMapKey
  >,
  answerTable: IMapMapped<
    DatetimeRange,
    DeepReadonly<
      [iconId: AnswerIconIdWithNone, point: AnswerIconPoint, comment: string][]
    >,
    DatetimeRangeMapKey
  >,
  answers: readonly Answer[]
): IMapMapped<DatetimeRange, number, DatetimeRangeMapKey> =>
  IMapMapped.new(
    datetimeRangeList.map((datetimeRange) => {
      const summaryForThisDatetimeRange: ArrayOfLength<3, number> | undefined =
        answerSummary.get(datetimeRange);

      const answerPointList = answerTable
        .get(datetimeRange)
        ?.map(([_iconId, point]) => point);

      if (
        summaryForThisDatetimeRange === undefined ||
        answerPointList === undefined
      ) {
        return [datetimeRange, 0];
      }

      const weightList = answers.map((a) => a.weight);
      const isRequiredParticipantsList = answers.map(
        (a) => a.isRequiredParticipants
      );

      const scoreSum: number = calcScoreSum(
        answerPointList,
        weightList,
        isRequiredParticipantsList
      );
      const scoreMax: number = calcScoreSumMax(weightList);

      return [datetimeRange, answers.length === 0 ? 0 : scoreSum / scoreMax];
    }),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey
  );
