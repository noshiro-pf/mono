import {
  Arr,
  type IMap,
  IMapMapped,
  Num,
  Optional,
  pipe,
  tp,
} from 'ts-data-forge';
import { type DeepReadonly, type FixedLengthTuple } from 'ts-type-forge';
import { answerIconPointConfig } from '../../constants/index.mjs';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../map-key/index.mjs';

export const createAnswerSummary = (
  datetimeRangeList: readonly DatetimeRange[],
  answerTable: IMapMapped<
    DatetimeRange,
    DeepReadonly<
      [iconId: AnswerIconIdWithNone, point: AnswerIconPoint, comment: string][]
    >,
    DatetimeRangeMapKey
  >,
): IMapMapped<
  DatetimeRange,
  FixedLengthTuple<3, number>,
  DatetimeRangeMapKey
> =>
  IMapMapped.create(
    datetimeRangeList.map((datetimeRange) => {
      const answersForThisDatetimeRange:
        | DeepReadonly<
            [
              iconId: AnswerIconIdWithNone,
              point: AnswerIconPoint,
              comment: string,
            ][]
          >
        | undefined = Optional.toNullable(answerTable.get(datetimeRange));

      if (answersForThisDatetimeRange === undefined) {
        return tp(datetimeRange, tp(0, 0, 0));
      }

      const answerGroups: IMap<AnswerIconIdWithNone, number> = pipe(
        answersForThisDatetimeRange.map(([iconId, _point]) => iconId),
      )
        .map(Arr.groupBy((x) => x))
        .map((groups) => groups.map((v) => v.length)).value;

      const counts = tp(
        Optional.toNullable(answerGroups.get('good')) ?? 0,
        Optional.toNullable(answerGroups.get('fair')) ?? 0,
        Optional.toNullable(answerGroups.get('poor')) ?? 0,
      );

      return tp(datetimeRange, counts);
    }),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );

const calcScoreSum = (
  answerPointList: readonly AnswerIconPoint[],
  answerWeightList: readonly Weight[],
  isRequiredParticipantsList: readonly boolean[],
): number => {
  // Indexed rather than zipped: `Arr.zip` over these branded element types
  // produces a union the checker cannot represent (TS2590), and the lists are
  // parallel by construction anyway.
  const someRequiredParticipantsScoreIs0 = isRequiredParticipantsList.some(
    (required, i) => required && answerPointList[i] === 0,
  );

  return someRequiredParticipantsScoreIs0
    ? 0
    : Arr.sum(
        answerPointList.map((score, i) => score * (answerWeightList[i] ?? 0)),
      );
};

const calcScoreSumMax = (answerWeightList: readonly Weight[]): number =>
  Arr.sum(answerWeightList.map((w) => w * answerIconPointConfig.max));

export const createScore = (
  datetimeRangeList: readonly DatetimeRange[],
  answerSummary: IMapMapped<
    DatetimeRange,
    FixedLengthTuple<3, number>,
    DatetimeRangeMapKey
  >,
  answerTable: IMapMapped<
    DatetimeRange,
    DeepReadonly<
      [iconId: AnswerIconIdWithNone, point: AnswerIconPoint, comment: string][]
    >,
    DatetimeRangeMapKey
  >,
  answers: readonly Answer[],
): IMapMapped<DatetimeRange, number, DatetimeRangeMapKey> =>
  IMapMapped.create(
    datetimeRangeList.map((datetimeRange) => {
      const summaryForThisDatetimeRange:
        FixedLengthTuple<3, number> | undefined = Optional.toNullable(
        answerSummary.get(datetimeRange),
      );

      const answerPointList = Optional.toNullable(
        answerTable.get(datetimeRange),
      )?.map(([_iconId, point]) => point);

      if (
        summaryForThisDatetimeRange === undefined ||
        answerPointList === undefined
      ) {
        return [datetimeRange, 0];
      }

      const weightList = answers.map((a) => a.weight);

      const isRequiredParticipantsList = answers.map(
        (a) => a.isRequiredParticipants,
      );

      const scoreSum: number = calcScoreSum(
        answerPointList,
        weightList,
        isRequiredParticipantsList,
      );

      const scoreMax: number = calcScoreSumMax(weightList);

      return [
        datetimeRange,
        Arr.isEmpty(answers) || !Num.isPositive(scoreMax)
          ? 0
          : Num.div(scoreSum, scoreMax),
      ];
    }),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );
