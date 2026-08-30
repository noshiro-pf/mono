import { asSafeUint, Num, pipe, SafeUint } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import {
  type DetailedFilterIcon,
  type NumIconFilterState,
} from '../../types/index.mjs';
import {
  type MonoTypeFunction,
  Obj,
  type Reducer,
} from '../../utils-ported/index.mjs';

export type AnswerIconFilterState = DeepReadonly<{
  good: NumIconFilterState;
  fair: NumIconFilterState;
  poor: NumIconFilterState;
  goodPlusFair: NumIconFilterState;
  fairPlusPoor: NumIconFilterState;
  upperLimit: SafeUint;
}>;

const initialState: AnswerIconFilterState = {
  good: { enabled: false, min: asSafeUint(0), max: SafeUint.MAX_VALUE },
  fair: { enabled: false, min: asSafeUint(0), max: SafeUint.MAX_VALUE },
  poor: { enabled: false, min: asSafeUint(0), max: SafeUint.MAX_VALUE },
  goodPlusFair: { enabled: false, min: asSafeUint(0), max: SafeUint.MAX_VALUE },
  fairPlusPoor: { enabled: false, min: asSafeUint(0), max: SafeUint.MAX_VALUE },
  upperLimit: SafeUint.MAX_VALUE,
} as const;

export type AnswerIconFilterStateAction = DeepReadonly<
  | { type: 'disableFiltering'; iconId: DetailedFilterIcon }
  | { type: 'enableFiltering'; iconId: DetailedFilterIcon }
  | { type: 'reset' }
  | {
      type: 'setFromUrlQueryParams';
      values: {
        good: { min: SafeUint | undefined; max: SafeUint | undefined };
        fair: { min: SafeUint | undefined; max: SafeUint | undefined };
        poor: { min: SafeUint | undefined; max: SafeUint | undefined };
        goodPlusFair: { min: SafeUint | undefined; max: SafeUint | undefined };
        fairPlusPoor: { min: SafeUint | undefined; max: SafeUint | undefined };
      };
    }
  | { type: 'setMax'; iconId: DetailedFilterIcon; value: SafeUint }
  | { type: 'setMin'; iconId: DetailedFilterIcon; value: SafeUint }
  | { type: 'setUpperLimit'; upperLimit: SafeUint }
>;

const normalizeState = ({
  good,
  fair,
  poor,
  goodPlusFair,
  fairPlusPoor,
  upperLimit,
}: AnswerIconFilterState): AnswerIconFilterState => {
  // `Num.clamp` returns a plain number now; the brand is re-applied here.
  const clamp = (value: SafeUint): SafeUint =>
    asSafeUint(Num.clamp(value, 0, upperLimit));

  const helperFn = (
    s: AnswerIconFilterState['good'],
  ): AnswerIconFilterState['good'] =>
    ({
      enabled: s.enabled,
      min: clamp(s.min),
      max: clamp(SafeUint.max(s.min, s.max)),
    }) as const;

  return {
    good: helperFn(good),
    fair: helperFn(fair),
    poor: helperFn(poor),
    goodPlusFair: helperFn(goodPlusFair),
    fairPlusPoor: helperFn(fairPlusPoor),
    upperLimit,
  };
};

const reducer: Reducer<AnswerIconFilterState, AnswerIconFilterStateAction> = (
  currentState,
  action,
) =>
  pipe(currentState)
    .map((state) => {
      switch (action.type) {
        case 'reset': {
          const { upperLimit } = state;

          const nextState: AnswerIconFilterState = {
            good: { enabled: false, min: asSafeUint(0), max: upperLimit },
            fair: { enabled: false, min: asSafeUint(0), max: upperLimit },
            poor: { enabled: false, min: asSafeUint(0), max: upperLimit },
            goodPlusFair: {
              enabled: false,
              min: asSafeUint(0),
              max: upperLimit,
            },
            fairPlusPoor: {
              enabled: false,
              min: asSafeUint(0),
              max: upperLimit,
            },
            upperLimit,
          } as const;

          return nextState;
        }

        case 'setFromUrlQueryParams': {
          const { upperLimit } = state;

          const { good, fair, poor, goodPlusFair, fairPlusPoor } =
            action.values;

          const nextState: AnswerIconFilterState = {
            good: {
              enabled: good.min !== undefined || good.max !== undefined,
              min: good.min ?? asSafeUint(0),
              max: good.max ?? upperLimit,
            },
            fair: {
              enabled: fair.min !== undefined || fair.max !== undefined,
              min: fair.min ?? asSafeUint(0),
              max: fair.max ?? upperLimit,
            },
            poor: {
              enabled: poor.min !== undefined || poor.max !== undefined,
              min: poor.min ?? asSafeUint(0),
              max: poor.max ?? upperLimit,
            },
            goodPlusFair: {
              enabled:
                goodPlusFair.min !== undefined ||
                goodPlusFair.max !== undefined,
              min: goodPlusFair.min ?? asSafeUint(0),
              max: goodPlusFair.max ?? upperLimit,
            },
            fairPlusPoor: {
              enabled:
                fairPlusPoor.min !== undefined ||
                fairPlusPoor.max !== undefined,
              min: fairPlusPoor.min ?? asSafeUint(0),
              max: fairPlusPoor.max ?? upperLimit,
            },

            upperLimit,
          } as const;

          return nextState;
        }

        case 'enableFiltering':
          return Obj.update(state, action.iconId, (a) => ({
            ...a,
            enabled: true,
          }));

        case 'disableFiltering':
          return Obj.set(state, action.iconId, {
            enabled: false,
            min: asSafeUint(0),
            max: state.upperLimit,
          });

        case 'setMin': {
          const next = asSafeUint(Num.clamp(action.value, 0, state.upperLimit));

          return Obj.update(state, action.iconId, (a) => ({
            ...a,
            min: next,
            max: SafeUint.max(next, state[action.iconId].max),
          }));
        }

        case 'setMax': {
          const next = asSafeUint(Num.clamp(action.value, 0, state.upperLimit));

          return Obj.update(state, action.iconId, (a) => ({
            ...a,
            max: next,
            min: SafeUint.min(next, state[action.iconId].min),
          }));
        }

        case 'setUpperLimit': {
          const { upperLimit } = action;

          const helperFn: MonoTypeFunction<
            Readonly<{ enabled: boolean; min: SafeUint; max: SafeUint }>
          > = (st) =>
            !st.enabled
              ? ({ ...st, max: upperLimit } as const) // フィルタがoffのときはデフォルト値で更新
              : pipe(st)
                  .map((a) =>
                    Obj.update(a, 'min', (m) => SafeUint.min(upperLimit, m)),
                  )
                  .map((a) =>
                    Obj.update(a, 'max', (m) => SafeUint.min(upperLimit, m)),
                  ).value; // 回答が減ったとき

          return pipe(state)
            .map((st) => ({ ...st, upperLimit }))
            .map((st) => Obj.update(st, 'good', helperFn))
            .map((st) => Obj.update(st, 'fair', helperFn))
            .map((st) => Obj.update(st, 'poor', helperFn))
            .map((st) => Obj.update(st, 'goodPlusFair', helperFn))
            .map((st) => Obj.update(st, 'fairPlusPoor', helperFn)).value;
        }
      }
    })
    .map(normalizeState).value;

export const AnswerIconFilterState = { initialState, reducer } as const;
