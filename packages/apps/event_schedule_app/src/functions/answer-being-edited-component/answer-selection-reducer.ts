import type {
  AnswerIconId,
  AnswerIconPoint,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import { defaultIconPoint } from '../../constants';
import type { AnswerSelectionValue } from '../../types';
import type { DatetimeRangeMapKey } from '../map-key';

export type AnswerSelectionReducerAction = Readonly<
  | {
      type: 'cell-icon';
      datetimeRange: DatetimeRange;
      icon: AnswerIconId;
    }
  | {
      type: 'cell-point';
      datetimeRange: DatetimeRange;
      point: AnswerIconPoint;
    }
  | {
      type: 'header';
      icon: AnswerIconId;
      datetimeRangeList: readonly DatetimeRange[];
    }
>;

export type AnswerSelectionReducerState = IMapMapped<
  DatetimeRange,
  AnswerSelectionValue,
  DatetimeRangeMapKey
>;

export const answerSelectionReducer: ReducerType<
  AnswerSelectionReducerState,
  AnswerSelectionReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'cell-icon':
      return state.update(action.datetimeRange, ({ iconId: prevIcon }) => {
        const nextIcon = prevIcon === action.icon ? 'none' : action.icon;
        return {
          iconId: nextIcon,
          point: match(nextIcon, defaultIconPoint),
        };
      });

    case 'cell-point':
      return state.update(action.datetimeRange, (prev) =>
        IRecord.set(prev, 'point', action.point)
      );

    case 'header':
      return state.every(({ iconId }) => iconId === action.icon)
        ? state.map<AnswerSelectionValue>(() => ({
            iconId: 'none',
            point: 0,
          }))
        : state.map<AnswerSelectionValue>(() => ({
            iconId: action.icon,
            point: match(action.icon, defaultIconPoint),
          }));
  }
};
