import type {
  Answer,
  AnswerId,
  AnswerSymbolIconId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped, ituple } from '@noshiro/ts-utils';
import type { DatetimeRangeMapKey } from '../map-key';
import { datetimeRangeFromMapKey, datetimeRangeToMapKey } from '../map-key';

export const createAnswerTable = (
  answerSelectionMapFn: (
    datetimeRange: DatetimeRange,
    answerId: AnswerId
  ) => AnswerSymbolIconId | undefined,
  datetimeRangeList: readonly DatetimeRange[],
  answers: readonly Answer[]
): IMapMapped<
  DatetimeRange,
  readonly (AnswerSymbolIconId | undefined)[],
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
