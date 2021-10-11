import type {
  Answer,
  AnswerId,
  AnswerSymbolIdWithNone,
  AnswerSymbolPoint,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped, ituple } from '@noshiro/ts-utils';
import type { DatetimeRangeMapKey } from '../map-key';
import { datetimeRangeFromMapKey, datetimeRangeToMapKey } from '../map-key';

export const createAnswerTable = (
  answerSelectionMapFn: (
    datetimeRange: DatetimeRange,
    answerId: AnswerId
  ) => readonly [AnswerSymbolIdWithNone, AnswerSymbolPoint],
  datetimeRangeList: readonly DatetimeRange[],
  answers: readonly Answer[]
): IMapMapped<
  DatetimeRange,
  DeepReadonly<[AnswerSymbolIdWithNone, AnswerSymbolPoint][]>,
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
