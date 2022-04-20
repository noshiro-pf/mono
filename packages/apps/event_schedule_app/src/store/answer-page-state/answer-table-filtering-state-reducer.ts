import type { AnswerTableFilteringState } from '../../types';

export namespace AnswerTableFilteringStateReducer {
  export const initialState: AnswerTableFilteringState = {
    good: {
      filteringEnabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    fair: {
      filteringEnabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    poor: {
      filteringEnabled: false,
      min: 0,
      max: Num.POSITIVE_INFINITY,
    },
    upperLimit: Num.POSITIVE_INFINITY,
  };

  type Action = DeepReadonly<
    | {
        type: 'disableFiltering';
        iconId: AnswerIconId;
      }
    | {
        type: 'enableFiltering';
        iconId: AnswerIconId;
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
        };
      }
    | {
        type: 'setMax';
        iconId: AnswerIconId;
        value: number;
      }
    | {
        type: 'setMin';
        iconId: AnswerIconId;
        value: number;
      }
    | {
        type: 'setUpperLimit';
        upperLimit: number;
      }
  >;

  export const reducer: ReducerType<AnswerTableFilteringState, Action> = (
    state,
    action
  ) => {
    switch (action.type) {
      case 'reset':
        return {
          good: {
            filteringEnabled: false,
            min: 0,
            max: state.upperLimit,
          },
          fair: {
            filteringEnabled: false,
            min: 0,
            max: state.upperLimit,
          },
          poor: {
            filteringEnabled: false,
            min: 0,
            max: state.upperLimit,
          },
          upperLimit: state.upperLimit,
        };

      case 'setFromUrlQueryParams': {
        const { upperLimit } = state;
        const { good, fair, poor } = action.values;
        const nextState: AnswerTableFilteringState = {
          good: {
            filteringEnabled: good.min !== undefined || good.max !== undefined,
            min: good.min ?? 0,
            max: good.max ?? upperLimit,
          },
          fair: {
            filteringEnabled: fair.min !== undefined || fair.max !== undefined,
            min: fair.min ?? 0,
            max: fair.max ?? upperLimit,
          },
          poor: {
            filteringEnabled: poor.min !== undefined || poor.max !== undefined,
            min: poor.min ?? 0,
            max: poor.max ?? upperLimit,
          },
          upperLimit,
        };
        return nextState;
      }

      case 'enableFiltering':
        return IRecord.update(state, action.iconId, (a) =>
          IRecord.set(a, 'filteringEnabled', true)
        );

      case 'disableFiltering':
        return IRecord.set(state, action.iconId, {
          filteringEnabled: false,
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
                IRecord.set(v, 'max', Math.max(next, state[action.iconId].max))
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
                IRecord.set(v, 'min', Math.min(next, state[action.iconId].min))
              ).value
        );
      }

      case 'setUpperLimit': {
        const helperFn: MonoTypeFunction<
          Readonly<{
            filteringEnabled: boolean;
            min: number;
            max: number;
          }>
        > = (s) =>
          !s.filteringEnabled
            ? IRecord.set(s, 'max', action.upperLimit) // フィルタがoffのときはデフォルト値で更新
            : pipe(s)
                .chain((a) =>
                  IRecord.update(a, 'min', (m) =>
                    Math.min(action.upperLimit, m)
                  )
                )
                .chain((a) =>
                  IRecord.update(a, 'max', (m) =>
                    Math.min(action.upperLimit, m)
                  )
                ).value; // 回答が減ったとき

        return pipe(state)
          .chain((st) => IRecord.set(st, 'upperLimit', action.upperLimit))
          .chain((st) => IRecord.update(st, 'good', helperFn))
          .chain((st) => IRecord.update(st, 'fair', helperFn))
          .chain((st) => IRecord.update(st, 'poor', helperFn)).value;
      }
    }
  };
}
