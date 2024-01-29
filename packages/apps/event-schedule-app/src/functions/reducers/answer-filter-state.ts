import { compareYmd, toUserName } from '@noshiro/event-schedule-app-shared';
import { type AnswerRank, type AnswersScore } from '../../types';
import {
  AnswerIconFilterState,
  type AnswerIconFilterStateAction,
} from './answer-icon-filter-state';

type UserNameAndIconId = readonly [UserName, AnswerIconIdWithNone];

export type AnswerFilterState = DeepReadonly<{
  iconState: AnswerIconFilterState;

  filledDateOnly: boolean;

  rank: {
    enabled: boolean;
    value: AnswerRank;
  };

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

  respondent: {
    enabled: boolean;
    falseKeys: ISet<UserName>;
  };
}>;

const initialState: AnswerFilterState = {
  iconState: AnswerIconFilterState.initialState,

  filledDateOnly: false,

  rank: {
    enabled: false,
    value: 3,
  },

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
        toUserName(key.slice(0, -6)),
        key.endsWith(`--good`)
          ? 'good'
          : key.endsWith(`--fair`)
            ? 'fair'
            : key.endsWith(`--poor`)
              ? 'poor'
              : 'none',
      ],
    ),
  },

  respondent: {
    enabled: false,
    falseKeys: ISet.new<UserName>([]),
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
      type: 'set-enabled-filtering-by-rank';
      value: boolean;
    }
  | {
      type: 'set-enabled-filtering-by-respondent';
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
      type: 'set-rank';
      rank: AnswerRank;
    }
  | {
      type: 'set-respondent';
      username: UserName;
      value: boolean;
    }
  | {
      type: 'set-scoreRange-max';
      max: AnswersScore;
    }
  | {
      type: 'set-scoreRange-min';
      min: AnswersScore;
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
        rank: AnswerRank | undefined;
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

const reducer: Reducer<AnswerFilterState, AnswerFilterStateAction> = (
  currentState,
  action,
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
                state.dateRange.defaultValue,
              ),
            )
            .chain((draft) =>
              Obj.setIn(
                draft,
                ['dateRange', 'value'],
                state.dateRange.defaultValue ?? initialState.dateRange.value,
              ),
            )
            .chain((draft) =>
              Obj.set(
                draft,
                'iconState',
                AnswerIconFilterState.reducer(state.iconState, {
                  type: 'reset',
                }),
              ),
            ).value;

        case 'icon':
          return Obj.set(
            state,
            'iconState',
            AnswerIconFilterState.reducer(state.iconState, action.action),
          );

        case 'setFromUrlQueryParams': {
          const {
            dateRange,
            dayOfWeek,
            filledDateOnly,
            iconState,
            scoreRange,
            rank,
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
            rank: {
              enabled: isNotUndefined(rank),
              value: rank ?? init.rank.value,
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

            respondent: state.respondent,
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
                },
          );
        }

        case 'set-enabled-filtering-by-rank':
          return state.rank.enabled === action.value
            ? state // check変更無しならそのまま返す
            : !action.value // 無効化されたらリセット
              ? Obj.set(state, 'rank', {
                  enabled: false,
                  value: initialState.rank.value,
                })
              : Obj.setIn(state, ['rank', 'enabled'], true);

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
                    state.dateRange.defaultValue ??
                    initialState.dateRange.value,
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
              : Obj.setIn(
                  state,
                  ['iconOfSpecifiedRespondent', 'enabled'],
                  true,
                );

        case 'set-enabled-filtering-by-respondent':
          return state.respondent.enabled === action.value
            ? state // check変更無しならそのまま返す
            : !action.value // 無効化されたらリセット
              ? Obj.set(state, 'respondent', {
                  enabled: false,
                  falseKeys: initialState.respondent.falseKeys,
                })
              : Obj.setIn(state, ['respondent', 'enabled'], true);

        case 'set-iconOfSpecifiedRespondent': {
          const { iconId, username, value } = action;

          if (value) {
            // check value is true
            return Obj.updateIn(
              state,
              ['iconOfSpecifiedRespondent', 'falseKeys'] as const,
              (st) => st.delete([username, iconId]),
            );
          } else {
            // check value is false
            return Obj.updateIn(
              state,
              ['iconOfSpecifiedRespondent', 'falseKeys'] as const,
              (st) => st.add([username, iconId]),
            );
          }
        }

        case 'set-respondent': {
          const { username, value } = action;

          if (value) {
            // check value is true
            return Obj.updateIn(
              state,
              ['respondent', 'falseKeys'] as const,
              (st) => st.delete(username),
            );
          } else {
            // check value is false
            return Obj.updateIn(
              state,
              ['respondent', 'falseKeys'] as const,
              (st) => st.add(username),
            );
          }
        }

        case 'set-filledDateOnly':
          return Obj.update(state, 'filledDateOnly', (b) => !b);

        case 'set-rank':
          return Obj.setIn(state, ['rank', 'value'], action.rank);

        case 'set-scoreRange-min':
          return Obj.setIn(state, ['scoreRange', 'value', 'min'], action.min);

        case 'set-scoreRange-max':
          return Obj.setIn(state, ['scoreRange', 'value', 'max'], action.max);

        case 'set-scoreRange':
          return Obj.setIn(state, ['scoreRange', 'value'], action.range);

        case 'set-dateRange':
          return Obj.setIn(state, ['dateRange', 'value'], action.range);

        case 'set-dayOfWeek':
          return Obj.updateIn(state, ['dayOfWeek', 'value'] as const, (draft) =>
            Obj.set(draft, action.value.key, action.value.checked),
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
          : { start, end },
      ),
    )
    .chain((state) =>
      Obj.updateIn(state, ['scoreRange', 'value'] as const, ({ min, max }) =>
        max < min ? { min, max: min } : { min, max },
      ),
    ).value;

export const AnswerFilterState = {
  initialState,
  reducer,
} as const;
