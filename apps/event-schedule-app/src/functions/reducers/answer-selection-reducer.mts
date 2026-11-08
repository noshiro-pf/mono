import {
  type IMapMapped,
  type ISetMapped,
  Optional,
  match,
} from 'ts-data-forge';
import type { Reducer } from 'ts-type-forge';
import { defaultIconPoint } from '../../constants/index.mjs';
import type { AnswerSelectionValue } from '../../types/index.mjs';

export type AnswerSelectionReducerAction = Readonly<
  | {
      type: 'batch-input';
      comment: string;
      selectedIconId: AnswerIconIdWithNone;
      point: AnswerIconPoint;
      checkboxState: ISetMapped<DatetimeRange, DatetimeRangeMapKey>;
    }
  | { type: 'cell-comment'; datetimeRange: DatetimeRange; comment: string }
  | {
      type: 'cell-icon';
      datetimeRange: DatetimeRange;
      icon: AnswerIconId;
      /** The event's `answerIcons.fair.point`, which picking fair stores. */
      fairPoint: AnswerIconPoint;
    }
  | { type: 'cell-point'; datetimeRange: DatetimeRange; point: AnswerIconPoint }
  | {
      type: 'header';
      icon: AnswerIconId;
      datetimeRangeList: readonly DatetimeRange[];
      /** The event's `answerIcons.fair.point`, which picking fair stores. */
      fairPoint: AnswerIconPoint;
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
                point: pointOf(nextIcon, action.fairPoint),
                comment,
              };
            },
          )
        : state.set(action.datetimeRange, {
            iconId: action.icon,
            point: pointOf(action.icon, action.fairPoint),
            comment: '',
          });

    case 'cell-point': {
      // A point means something only for fair, the one icon whose point is
      // editable, so it is taken only by a range already answered fair.
      const prev = Optional.toNullable(state.get(action.datetimeRange));

      return prev?.iconId === 'fair'
        ? state.set(action.datetimeRange, { ...prev, point: action.point })
        : state;
    }

    case 'cell-comment':
      return state.has(action.datetimeRange)
        ? state.update(action.datetimeRange, (prev) => ({
            ...prev,
            comment: action.comment,
          }))
        : state.set(action.datetimeRange, {
            point: defaultIconPoint.none,
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
                point: defaultIconPoint.none,
                comment: Optional.toNullable(state.get(d))?.comment ?? '',
              }
            : {
                iconId: action.icon,
                point: pointOf(action.icon, action.fairPoint),
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
            point: pointOf(action.selectedIconId, action.point),
            comment: action.comment,
          },
        })),
      );
    }
  }
};

/**
 * The point an answer of `icon` stores: fair's is the one given (the event's,
 * or what the batch input sets), the others' are fixed.
 */
const pointOf = (
  icon: AnswerIconIdWithNone,
  fairPoint: AnswerIconPoint,
): AnswerIconPoint =>
  match(icon, {
    good: defaultIconPoint.good,
    fair: fairPoint,
    poor: defaultIconPoint.poor,
    none: defaultIconPoint.none,
  });
