import type {
  Answer,
  AnswerIconIdWithNone,
  AnswerIconPoint,
  AnswerId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped, ituple } from '@noshiro/ts-utils';
import type { DatetimeRangeMapKey } from '../map-key';
import { datetimeRangeFromMapKey, datetimeRangeToMapKey } from '../map-key';

export const createAnswerTable = (
  answerSelectionMapFn: (
    datetimeRange: DatetimeRange,
    answerId: AnswerId
  ) => readonly [AnswerIconIdWithNone, AnswerIconPoint],
  datetimeRangeList: readonly DatetimeRange[],
  answers: readonly Answer[]
): IMapMapped<
  DatetimeRange,
  DeepReadonly<[AnswerIconIdWithNone, AnswerIconPoint][]>,
  DatetimeRangeMapKey
> =>
  IMapMapped.new(
    IList.map(datetimeRangeList, (datetimeRange) =>
      ituple(
        datetimeRange,
        IList.map(answers, (answer) =>
          answerSelectionMapFn(datetimeRange, answer.id)
        )
      )
    ),
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey
  );
