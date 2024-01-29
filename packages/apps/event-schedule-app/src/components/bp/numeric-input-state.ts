export type NumericInputStateBaseAction<NumericValue extends number> =
  DeepReadonly<
    | {
        type: 'set-normalizer-fn';
        normalizerFn: (value: number) => NumericValue;
      }
    | { type: 'decrement' }
    | { type: 'increment' }
    | { type: 'normalize' }
    | { type: 'set-string'; value: string }
  >;

export const parseValue = (valueStr: string): number | undefined =>
  pipe(Number.parseFloat(valueStr)).chain((a) =>
    Number.isNaN(a) ? undefined : a,
  ).value;

type State<NumericValue extends number> = Readonly<{
  value: string;
  normalizerFn: (value: number) => NumericValue;
}>;

export const createNumericInputStateReducer =
  <NumericValue extends number>(
    config: Readonly<{
      step: number;
      defaultValue: NumericValue;
    }>,
  ): Reducer<State<NumericValue>, NumericInputStateBaseAction<NumericValue>> =>
  (state, action) => {
    switch (action.type) {
      case 'set-normalizer-fn':
        return {
          value: state.value,
          normalizerFn: action.normalizerFn,
        };

      case 'set-string':
        return Obj.set(state, 'value', action.value);

      case 'normalize':
        return Obj.set(
          state,
          'value',

          pipe(state.value)
            .chain(parseValue)
            .chainOptional(state.normalizerFn)
            .chain((n) => n ?? config.defaultValue)
            .chain((n) => n.toString()).value,
        );

      case 'increment':
      case 'decrement': {
        return Obj.set(
          state,
          'value',
          pipe(state.value)
            .chain(parseValue)
            .chainOptional((v) =>
              match(action.type, {
                decrement: v - config.step,
                increment: v + config.step,
              }),
            )
            .chainOptional(state.normalizerFn)
            .chain((n) => n ?? config.defaultValue)
            .chain((n) => n.toString()).value,
        );
      }
    }
  };
