import { type IMapMapped, type ISetMapped, Optional } from 'ts-data-forge';
import { defaultIconPoint } from '../../constants/index.mjs';
import { type AnswerSelectionValue } from '../../types/index.mjs';
import { type Reducer, match } from '../../utils-ported/index.mjs';

export type AnswerSelectionReducerAction = Readonly<
  | {
      type: 'batch-input';
      comment: string;
      selectedIconId: AnswerIconIdWithNone;
      point: AnswerIconPoint;
      checkboxState: ISetMapped<DatetimeRange, DatetimeRangeMapKey>;
    }
  | { type: 'cell-comment'; datetimeRange: DatetimeRange; comment: string }
  | { type: 'cell-icon'; datetimeRange: DatetimeRange; icon: AnswerIconId }
  | { type: 'cell-point'; datetimeRange: DatetimeRange; point: AnswerIconPoint }
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
            },
          )
        : state.set(action.datetimeRange, {
            iconId: action.icon,
            point: match(action.icon, defaultIconPoint),
            comment: '',
          });

    case 'cell-point':
      return state.has(action.datetimeRange)
        ? state.update(action.datetimeRange, (prev) => ({
            ...prev,
            point: action.point,
          }))
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
        ? state.update(action.datetimeRange, (prev) => ({
            ...prev,
            comment: action.comment,
          }))
        : state.set(action.datetimeRange, {
            point: 0,
            iconId: 'none',
            comment: action.comment,
          });

    case 'header': {
      const allSelected = action.datetimeRangeList.every(
        (d) => Optional.toNullable(state.get(d))?.iconId === action.icon,
      );

      return state.withMutations(
        action.datetimeRangeList.map((d) => ({
          type: 'set' as const,
          key: d,
          value: allSelected
            ? {
                iconId: 'none',
                point: 0,
                comment: Optional.toNullable(state.get(d))?.comment ?? '',
              }
            : {
                iconId: action.icon,
                point: match(action.icon, defaultIconPoint),
                comment: Optional.toNullable(state.get(d))?.comment ?? '',
              },
        })),
      );
    }

    case 'batch-input': {
      const checked = action.checkboxState.toArray();

      return state.withMutations(
        checked.map((d) => ({
          type: 'set' as const,
          key: d,
          value: {
            iconId: action.selectedIconId,
            point: match(action.selectedIconId, {
              good: defaultIconPoint.good,
              fair: action.point,
              poor: defaultIconPoint.poor,
              none: defaultIconPoint.none,
            }),
            comment: action.comment,
          },
        })),
      );
    }
  }
};
