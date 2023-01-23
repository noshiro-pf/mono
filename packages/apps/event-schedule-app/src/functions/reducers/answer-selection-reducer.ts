import { defaultIconPoint } from '../../constants';
import { type AnswerSelectionValue } from '../../types';

export type AnswerSelectionReducerAction = Readonly<
  | {
      type: 'cell-comment';
      datetimeRange: DatetimeRange;
      comment: string;
    }
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
      return state.update(
        action.datetimeRange,
        ({ iconId: prevIcon, comment }) => {
          const nextIcon = prevIcon === action.icon ? 'none' : action.icon;
          return {
            iconId: nextIcon,
            point: match(nextIcon, defaultIconPoint),
            comment,
          };
        }
      );

    case 'cell-point':
      return state.update(action.datetimeRange, (prev) =>
        Obj.set(prev, 'point', action.point)
      );

    case 'cell-comment':
      return state.update(action.datetimeRange, (prev) =>
        Obj.set(prev, 'comment', action.comment)
      );

    case 'header':
      return state.every(({ iconId }) => iconId === action.icon)
        ? state.map<AnswerSelectionValue>(({ comment }) => ({
            iconId: 'none',
            point: 0,
            comment,
          }))
        : state.map<AnswerSelectionValue>(({ comment }) => ({
            iconId: action.icon,
            point: match(action.icon, defaultIconPoint),
            comment,
          }));
  }
};
