import type {
  Answer,
  AnswerId,
  AnswerSymbolIconId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-api';
import { IList, IMapMapped, ituple } from '@noshiro/ts-utils';
import type { DatetimeRangeMapKey } from '../../../functions';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../../../functions';

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
