export namespace NumericInputState {
  export type BaseAction = DeepReadonly<
    | { type: 'decrement' }
    | { type: 'increment' }
    | { type: 'normalize' }
    | { type: 'set-string'; value: string }
  >;

  const parseValue = (valueStr: string): number | undefined => {
    const res = Num.parseFloat(valueStr);
    if (res === undefined || Num.isNaN(res)) return undefined;
    return res;
  };

  export const createReducer = <
    NumericValue extends number,
    Action extends BaseAction = BaseAction
  >(
    normalizeValue: (value: number) => NumericValue,
    config: Readonly<{
      step: number;
      defaultValue: NumericValue;
    }>
  ): Readonly<{
    reducer: ReducerType<string, Action>;
    toValueNormalized: (valueStr: string) => NumericValue;
  }> => {
    const toValueNormalized = (valueStr: string): NumericValue =>
      pipe(valueStr).chain(parseValue).chainNullable(normalizeValue).value ??
      config.defaultValue;

    const reducer: ReducerType<string, Action> = (state, action) => {
      switch (action.type) {
        case 'set-string':
          return action.value;

        case 'normalize':
          return toValueNormalized(state).toString();

        case 'increment':
        case 'decrement': {
          const valueParsed = parseValue(state);
          const nextValue =
            pipe(valueParsed)
              .chainNullable((v) =>
                match(action.type, {
                  decrement: v - config.step,
                  increment: v + config.step,
                })
              )
              .chainNullable(normalizeValue).value ?? config.defaultValue;

          return nextValue.toString();
        }
      }
    };

    return { reducer, toValueNormalized };
  };
}