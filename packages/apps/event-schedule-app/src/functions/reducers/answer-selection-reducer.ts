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

export const answerSelectionReducer: Reducer<
  AnswerSelectionReducerState,
  AnswerSelectionReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'cell-icon':
      return state.has(action.datetimeRange)
        ? state.update(
            action.datetimeRange,
            ({ iconId: prevIcon, comment }) => {
              const nextIcon = prevIcon === action.icon ? 'none' : action.icon;
              return {
                iconId: nextIcon,
                point: match(nextIcon, defaultIconPoint),
                comment,
              };
            }
          )
        : state.set(action.datetimeRange, {
            iconId: action.icon,
            point: match(action.icon, defaultIconPoint),
            comment: '',
          });

    case 'cell-point':
      return state.has(action.datetimeRange)
        ? state.update(action.datetimeRange, (prev) =>
            Obj.set(prev, 'point', action.point)
          )
        : state.set(action.datetimeRange, {
            point: action.point,
            iconId:
              action.point === 0
                ? 'good'
                : action.point === 10
                ? 'poor'
                : 'fair',
            comment: '',
          });

    case 'cell-comment':
      return state.has(action.datetimeRange)
        ? state.update(action.datetimeRange, (prev) =>
            Obj.set(prev, 'comment', action.comment)
          )
        : state.set(action.datetimeRange, {
            point: 0,
            iconId: 'none',
            comment: action.comment,
          });

    case 'header': {
      const allSelected = action.datetimeRangeList.every(
        (d) => state.get(d)?.iconId === action.icon
      );
      return state.withMutations(
        action.datetimeRangeList.map((d) => ({
          type: 'set' as const,
          key: d,
          value: allSelected
            ? {
                iconId: 'none',
                point: 0,
                comment: state.get(d)?.comment ?? '',
              }
            : {
                iconId: action.icon,
                point: match(action.icon, defaultIconPoint),
                comment: state.get(d)?.comment ?? '',
              },
        }))
      );
    }
  }
};
