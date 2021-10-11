import type {
  AnswerSymbolIconId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import type { IMapMapped } from '@noshiro/ts-utils';
import type { DatetimeRangeMapKey } from '../map-key';

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
      return state.update(action.datetimeRange, (prevIcon) =>
        prevIcon === action.icon ? undefined : action.icon
      );
    case 'header':
      return state.every((icon) => icon === action.icon)
        ? state.map<AnswerSymbolIconId | undefined>(() => undefined)
        : state.map<AnswerSymbolIconId | undefined>(() => action.icon);
  }
};
