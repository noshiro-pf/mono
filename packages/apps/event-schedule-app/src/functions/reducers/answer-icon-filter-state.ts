import type { DetailedFilterIcon, NumIconFilterState } from '../../types';

export namespace AnswerIconFilterState {
  export type State = DeepReadonly<{
    good: NumIconFilterState;
    fair: NumIconFilterState;
    poor: NumIconFilterState;
    goodPlusFair: NumIconFilterState;
    fairPlusPoor: NumIconFilterState;
    upperLimit: number;
  }>;

  export const initialState: State = {
    good: {
      enabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    fair: {
      enabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    poor: {
      enabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    goodPlusFair: {
      enabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    fairPlusPoor: {
      enabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    upperLimit: Num.POSITIVE_INFINITY,
  };

  export type Action = DeepReadonly<
    | {
        type: 'disableFiltering';
        iconId: DetailedFilterIcon;
      }
    | {
        type: 'enableFiltering';
        iconId: DetailedFilterIcon;
      }
    | {
        type: 'reset';
      }
    | {
        type: 'setFromUrlQueryParams';
        values: {
          good: { min: number | undefined; max: number | undefined };
          fair: { min: number | undefined; max: number | undefined };
          poor: { min: number | undefined; max: number | undefined };
          goodPlusFair: { min: number | undefined; max: number | undefined };
          fairPlusPoor: { min: number | undefined; max: number | undefined };
        };
      }
    | {
        type: 'setMax';
        iconId: DetailedFilterIcon;
        value: number;
      }
    | {
        type: 'setMin';
        iconId: DetailedFilterIcon;
        value: number;
      }
    | {
        type: 'setUpperLimit';
        upperLimit: number;
      }
  >;

  const normalizeState = ({
    good,
    fair,
    poor,
    goodPlusFair,
    fairPlusPoor,
    upperLimit,
  }: State): State => {
    const clamp = Num.clamp(0, upperLimit);

    const helperFn = (s: State['good']): State['good'] => ({
      enabled: s.enabled,
      min: clamp(s.min),
      max: clamp(Math.max(s.min, s.max)),
    });

    return {
      good: helperFn(good),
      fair: helperFn(fair),
      poor: helperFn(poor),
      goodPlusFair: helperFn(goodPlusFair),
      fairPlusPoor: helperFn(fairPlusPoor),
      upperLimit,
    };
  };

  export const reducer: ReducerType<State, Action> = (currentState, action) =>
    pipe(currentState)
      .chain((state) => {
        switch (action.type) {
          case 'reset': {
            const { upperLimit } = state;
            const nextState: State = {
              good: {
                enabled: false,
                min: 0,
                max: upperLimit,
              },
              fair: {
                enabled: false,
                min: 0,
                max: upperLimit,
              },
              poor: {
                enabled: false,
                min: 0,
                max: upperLimit,
              },
              goodPlusFair: {
                enabled: false,
                min: 0,
                max: upperLimit,
              },
              fairPlusPoor: {
                enabled: false,
                min: 0,
                max: upperLimit,
              },
              upperLimit,
            };
            return nextState;
          }

          case 'setFromUrlQueryParams': {
            const { upperLimit } = state;
            const { good, fair, poor, goodPlusFair, fairPlusPoor } =
              action.values;
            const nextState: State = {
              good: {
                enabled: good.min !== undefined || good.max !== undefined,
                min: good.min ?? 0,
                max: good.max ?? upperLimit,
              },
              fair: {
                enabled: fair.min !== undefined || fair.max !== undefined,
                min: fair.min ?? 0,
                max: fair.max ?? upperLimit,
              },
              poor: {
                enabled: poor.min !== undefined || poor.max !== undefined,
                min: poor.min ?? 0,
                max: poor.max ?? upperLimit,
              },
              goodPlusFair: {
                enabled:
                  goodPlusFair.min !== undefined ||
                  goodPlusFair.max !== undefined,
                min: goodPlusFair.min ?? 0,
                max: goodPlusFair.max ?? upperLimit,
              },
              fairPlusPoor: {
                enabled:
                  fairPlusPoor.min !== undefined ||
                  fairPlusPoor.max !== undefined,
                min: fairPlusPoor.min ?? 0,
                max: fairPlusPoor.max ?? upperLimit,
              },

              upperLimit,
            };
            return nextState;
          }

          case 'enableFiltering':
            return IRecord.update(state, action.iconId, (a) =>
              IRecord.set(a, 'enabled', true)
            );

          case 'disableFiltering':
            return IRecord.set(state, action.iconId, {
              enabled: false,
              min: 0,
              max: state.upperLimit,
            });

          case 'setMin': {
            const next = Num.clamp(0, state.upperLimit)(action.value);

            return IRecord.update(
              state,
              action.iconId,
              (a) =>
                pipe(a)
                  .chain((v) => IRecord.set(v, 'min', next))
                  .chain((v) =>
                    IRecord.set(
                      v,
                      'max',
                      Math.max(next, state[action.iconId].max)
                    )
                  ).value
            );
          }

          case 'setMax': {
            const next = Num.clamp(0, state.upperLimit)(action.value);
            return IRecord.update(
              state,
              action.iconId,
              (a) =>
                pipe(a)
                  .chain((v) => IRecord.set(v, 'max', next))
                  .chain((v) =>
                    IRecord.set(
                      v,
                      'min',
                      Math.min(next, state[action.iconId].min)
                    )
                  ).value
            );
          }

          case 'setUpperLimit': {
            const { upperLimit } = action;
            const helperFn: MonoTypeFunction<
              Readonly<{
                enabled: boolean;
                min: number;
                max: number;
              }>
            > = (st) =>
              !st.enabled
                ? IRecord.set(st, 'max', upperLimit) // フィルタがoffのときはデフォルト値で更新
                : pipe(st)
                    .chain((a) =>
                      IRecord.update(a, 'min', (m) => Math.min(upperLimit, m))
                    )
                    .chain((a) =>
                      IRecord.update(a, 'max', (m) => Math.min(upperLimit, m))
                    ).value; // 回答が減ったとき

            return pipe(state)
              .chain((st) => IRecord.set(st, 'upperLimit', upperLimit))
              .chain((st) => IRecord.update(st, 'good', helperFn))
              .chain((st) => IRecord.update(st, 'fair', helperFn))
              .chain((st) => IRecord.update(st, 'poor', helperFn))
              .chain((st) => IRecord.update(st, 'goodPlusFair', helperFn))
              .chain((st) => IRecord.update(st, 'fairPlusPoor', helperFn))
              .value;
          }
        }
      })
      .chain(normalizeState).value;
}