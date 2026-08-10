import { datetimeRangeFromMapKey, datetimeRangeToMapKey } from '../map-key';

export const createAnswerTable = (
  answerSelectionMapFn: (
    datetimeRange: DatetimeRange,
    answerId: AnswerId,
  ) => readonly [
    iconId: AnswerIconIdWithNone,
    point: AnswerIconPoint,
    comment: string,
  ],
  datetimeRangeList: readonly DatetimeRange[],
  answers: readonly Answer[],
): IMapMapped<
  DatetimeRange,
  DeepReadonly<
    [iconId: AnswerIconIdWithNone, point: AnswerIconPoint, comment: string][]
  >,
  DatetimeRangeMapKey
> =>
  IMapMapped.new(
    datetimeRangeList.map((datetimeRange) =>
      tp(
        datetimeRange,
        answers.map((answer) => answerSelectionMapFn(datetimeRange, answer.id)),
      ),
    ),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );
