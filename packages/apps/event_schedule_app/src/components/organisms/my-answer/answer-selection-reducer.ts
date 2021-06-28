import type {
  AnswerSymbolIconId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import type { ReducerType } from '@noshiro/ts-utils';
import { IMapMapped } from '@noshiro/ts-utils';
import type { DatetimeRangeMapKey } from '../../../functions';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../../../functions';

export type AnswerSelectionReducerAction = Readonly<
  | {
      type: 'cell';
      datetimeRange: DatetimeRange;
      icon: AnswerSymbolIconId | undefined;
    }
  | {
      type: 'header';
      icon: AnswerSymbolIconId | undefined;
      datetimeRangeList: readonly DatetimeRange[];
    }
>;

export type AnswerSelectionReducerState = IMapMapped<
  DatetimeRange,
  AnswerSymbolIconId | undefined,
  DatetimeRangeMapKey
>;

export const answerSelectionReducer: ReducerType<
  AnswerSelectionReducerState,
  AnswerSelectionReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'cell':
      return state.set(action.datetimeRange, action.icon);
    case 'header':
      return IMapMapped.new(
        action.datetimeRangeList.map((d) => [d, action.icon]),
        datetimeRangeToMapKey,
        datetimeRangeFromMapKey
      );
  }
};
