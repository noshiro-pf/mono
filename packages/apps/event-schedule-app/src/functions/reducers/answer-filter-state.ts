import { compareYmd } from '@noshiro/event-schedule-app-shared';
import { type AnswersScore } from '../../types';
import {
  AnswerIconFilterState,
  type AnswerIconFilterStateAction,
} from './answer-icon-filter-state';

type UserNameAndIconId = readonly [UserName, AnswerIconIdWithNone];

export type AnswerFilterState = DeepReadonly<{
  iconState: AnswerIconFilterState;

  filledDateOnly: boolean;

  scoreRange: {
    enabled: boolean;
    value: { min: AnswersScore; max: AnswersScore };
  };

  dateRange: {
    enabled: boolean;
    defaultValue:
      | {
          start: YearMonthDate;
          end: YearMonthDate;
        }
      | undefined;
    value: {
      start: YearMonthDate | undefined;
      end: YearMonthDate | undefined;
    };
  };

  dayOfWeek: {
    enabled: boolean;
    value: {
      Sun: boolean;
      Mon: boolean;
      Tue: boolean;
      Wed: boolean;
      Thr: boolean;
      Fri: boolean;
      Sat: boolean;
    };
  };

  iconOfSpecifiedRespondent: {
    enabled: boolean;
    falseKeys: ISetMapped<UserNameAndIconId, string>;
  };
}>;

const initialState: AnswerFilterState = {
  iconState: AnswerIconFilterState.initialState,

  filledDateOnly: false,
  scoreRange: {
    enabled: false,
    value: { min: 0, max: 1 },
  },
  dateRange: {
    enabled: false,
    defaultValue: undefined,
    value: {
      start: undefined,
      end: undefined,
    },
  },
  dayOfWeek: {
    enabled: false,
    value: {
      Sun: true,
      Mon: true,
      Tue: true,
      Wed: true,
      Thr: true,
      Fri: true,
      Sat: true,
    },
  },

  iconOfSpecifiedRespondent: {
    enabled: false,
    falseKeys: ISetMapped.new<UserNameAndIconId, string>(
      [],
      ([username, iconId]: UserNameAndIconId) => `${username}--${iconId}`,
      (key) => [
        key.slice(0, -6),
        key.endsWith(`--good`)
          ? 'good'
          : key.endsWith(`--fair`)
          ? 'fair'
          : key.endsWith(`--poor`)
          ? 'poor'
          : 'none',
      ]
    ),
  },
};

export type AnswerFilterStateAction = DeepReadonly<
  | {
      type: 'icon';
      action: AnswerIconFilterStateAction;
    }
  | {
      type: 'set-dateRange';
      range: {
        start: YearMonthDate | undefined;
        end: YearMonthDate | undefined;
      };
    }
  | {
      type: 'set-dateRangeDefaultValue';
      range: {
        start: YearMonthDate;
        end: YearMonthDate;
      };
    }
  | {
      type: 'set-dayOfWeek';
      value: {
        key: 'Fri' | 'Mon' | 'Sat' | 'Sun' | 'Thr' | 'Tue' | 'Wed';
        checked: boolean;
      };
    }
  | {
      type: 'set-enabled-filtering-by-dateRange';
      value: boolean;
    }
  | {
      type: 'set-enabled-filtering-by-dayOfWeek';
      value: boolean;
    }
  | {
      type: 'set-enabled-filtering-by-iconOfSpecifiedRespondent';
      value: boolean;
    }
  | {
      type: 'set-enabled-filtering-by-scoreRange';
      value: boolean;
    }
  | {
      type: 'set-filledDateOnly';
      checked: boolean;
    }
  | {
      type: 'set-iconOfSpecifiedRespondent';
      username: UserName;
      iconId: AnswerIconIdWithNone;
      value: boolean;
    }
  | {
      type: 'set-scoreRange';
      range: { min: AnswersScore; max: AnswersScore };
    }
  | {
      type: 'setFromUrlQueryParams';
      values: {
        iconState: {
          good: { min: number | undefined; max: number | undefined };
          fair: { min: number | undefined; max: number | undefined };
          poor: { min: number | undefined; max: number | undefined };
          goodPlusFair: { min: number | undefined; max: number | undefined };
          fairPlusPoor: { min: number | undefined; max: number | undefined };
        };
        filledDateOnly: boolean | undefined;
        scoreRange: {
          min: AnswersScore | undefined;
          max: AnswersScore | undefined;
        };
        dateRange: {
          start: YearMonthDate | undefined;
          end: YearMonthDate | undefined;
        };
        dayOfWeek:
          | {
              Sun: boolean;
              Mon: boolean;
              Tue: boolean;
              Wed: boolean;
              Thr: boolean;
              Fri: boolean;
              Sat: boolean;
            }
          | undefined;
      };
    }
  | { type: 'reset' }
>;

const reducer: ReducerType<AnswerFilterState, AnswerFilterStateAction> = (
  currentState,
  action
) =>
  pipe(currentState)
    .chain((state) => {
      switch (action.type) {
        case 'reset':
          return pipe(initialState)
            .chain((draft) =>
              Obj.setIn(
                draft,
                ['dateRange', 'defaultValue'],
                state.dateRange.defaultValue
              )
            )
            .chain((draft) =>
              Obj.setIn(
                draft,
                ['dateRange', 'value'],
                state.dateRange.defaultValue ?? initialState.dateRange.value
              )
            )
            .chain((draft) =>
              Obj.set(
                draft,
                'iconState',
                AnswerIconFilterState.reducer(state.iconState, {
                  type: 'reset',
                })
              )
            ).value;

        case 'icon':
          return Obj.set(
            state,
            'iconState',
            AnswerIconFilterState.reducer(state.iconState, action.action)
          );

        case 'setFromUrlQueryParams': {
          const {
            dateRange,
            dayOfWeek,
            filledDateOnly,
            iconState,
            scoreRange,
          } = action.values;

          const init = initialState;

          const nextState: AnswerFilterState = {
            dateRange: {
              enabled:
                isNotUndefined(dateRange.start) ||
                isNotUndefined(dateRange.end),
              defaultValue: state.dateRange.defaultValue,
              value: {
                start: dateRange.start ?? init.dateRange.value.start,
                end: dateRange.end ?? init.dateRange.value.end,
              },
            },
            dayOfWeek: {
              enabled: isNotUndefined(dayOfWeek),
              value: {
                Sun: dayOfWeek?.Sun ?? init.dayOfWeek.value.Sun,
                Mon: dayOfWeek?.Mon ?? init.dayOfWeek.value.Mon,
                Tue: dayOfWeek?.Tue ?? init.dayOfWeek.value.Tue,
                Wed: dayOfWeek?.Wed ?? init.dayOfWeek.value.Wed,
                Thr: dayOfWeek?.Thr ?? init.dayOfWeek.value.Thr,
                Fri: dayOfWeek?.Fri ?? init.dayOfWeek.value.Fri,
                Sat: dayOfWeek?.Sat ?? init.dayOfWeek.value.Sat,
              },
            },
            scoreRange: {
              enabled:
                isNotUndefined(scoreRange.min) ||
                isNotUndefined(scoreRange.max),
              value: {
                min: scoreRange.min ?? init.scoreRange.value.min,
                max: scoreRange.max ?? init.scoreRange.value.max,
              },
            },

            filledDateOnly: filledDateOnly ?? init.filledDateOnly,

            iconState: AnswerIconFilterState.reducer(state.iconState, {
              type: 'setFromUrlQueryParams',
              values: iconState,
            }),

            iconOfSpecifiedRespondent: state.iconOfSpecifiedRespondent,
          };

          return nextState;
        }

        case 'set-dateRangeDefaultValue': {
          const curr = state.dateRange;
          const currStart = curr.value.start;
          const currEnd = curr.value.end;

          return Obj.set(
            state,
            'dateRange',
            // 現在のdateRangeが日程候補の範囲外の値になっていたらリセット
            isUndefined(currStart) ||
              isUndefined(currEnd) ||
              compareYmd(currStart, action.range.start) < 0 ||
              compareYmd(action.range.end, currEnd) < 0
              ? {
                  defaultValue: action.range,
                  enabled: false,
                  value: action.range,
                }
              : {
                  defaultValue: action.range,
                  enabled: curr.enabled,
                  value: curr.value,
                }
          );
        }

        case 'set-enabled-filtering-by-scoreRange':
          return state.scoreRange.enabled === action.value
            ? state // check変更無しならそのまま返す
            : !action.value // 無効化されたらリセット
            ? Obj.set(state, 'scoreRange', {
                enabled: false,
                value: initialState.scoreRange.value,
              })
            : Obj.setIn(state, ['scoreRange', 'enabled'], true);

        case 'set-enabled-filtering-by-dayOfWeek':
          return state.dayOfWeek.enabled === action.value
            ? state // check変更無しならそのまま返す
            : !action.value // 無効化されたらリセット
            ? Obj.set(state, 'dayOfWeek', {
                enabled: false,
                value: initialState.dayOfWeek.value,
              })
            : Obj.setIn(state, ['dayOfWeek', 'enabled'], true);

        case 'set-enabled-filtering-by-dateRange':
          return state.dateRange.enabled === action.value
            ? state // check変更無しならそのまま返す
            : !action.value // 無効化されたらリセット
            ? Obj.set(state, 'dateRange', {
                enabled: false,
                defaultValue: state.dateRange.defaultValue,
                value:
                  state.dateRange.defaultValue ?? initialState.dateRange.value,
              })
            : Obj.setIn(state, ['dateRange', 'enabled'], true);

        case 'set-enabled-filtering-by-iconOfSpecifiedRespondent':
          return state.iconOfSpecifiedRespondent.enabled === action.value
            ? state // check変更無しならそのまま返す
            : !action.value // 無効化されたらリセット
            ? Obj.set(state, 'iconOfSpecifiedRespondent', {
                enabled: false,
                falseKeys: initialState.iconOfSpecifiedRespondent.falseKeys,
              })
            : Obj.setIn(state, ['iconOfSpecifiedRespondent', 'enabled'], true);

        case 'set-iconOfSpecifiedRespondent': {
          const { iconId, username, value } = action;

          if (value) {
            // check value is true
            return Obj.updateIn(
              state,
              ['iconOfSpecifiedRespondent', 'falseKeys'] as const,
              (st) => st.delete([username, iconId])
            );
          } else {
            // check value is false
            return Obj.updateIn(
              state,
              ['iconOfSpecifiedRespondent', 'falseKeys'] as const,
              (st) => st.add([username, iconId])
            );
          }
        }

        case 'set-filledDateOnly':
          return Obj.update(state, 'filledDateOnly', (b) => !b);

        case 'set-scoreRange':
          return Obj.setIn(state, ['scoreRange', 'value'], action.range);

        case 'set-dateRange':
          return Obj.setIn(state, ['dateRange', 'value'], action.range);

        case 'set-dayOfWeek':
          return Obj.updateIn(state, ['dayOfWeek', 'value'] as const, (draft) =>
            Obj.set(draft, action.value.key, action.value.checked)
          );
      }
    })
    // 不整合な状態になっていたら修正
    .chain((state) =>
      Obj.updateIn(state, ['dateRange', 'value'] as const, ({ start, end }) =>
        isNotUndefined(start) &&
        isNotUndefined(end) &&
        compareYmd(start, end) > 0
          ? { start, end: start }
          : { start, end }
      )
    )
    .chain((state) =>
      Obj.updateIn(state, ['scoreRange', 'value'] as const, ({ min, max }) =>
        max < min ? { min, max: min } : { min, max }
      )
    ).value;

export const AnswerFilterState = {
  initialState,
  reducer,
} as const;
