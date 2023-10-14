export type NumericInputStateBaseAction = DeepReadonly<
  | { type: 'decrement' }
  | { type: 'increment' }
  | { type: 'normalize' }
  | { type: 'set-string'; value: string }
>;

const parseValue = (valueStr: string): number | undefined =>
  pipe(Number.parseFloat(valueStr)).chain((a) =>
    Number.isNaN(a) ? undefined : a
  ).value;

export const createNumericInputStateReducer = <
  NumericValue extends number,
  Action extends NumericInputStateBaseAction = NumericInputStateBaseAction,
>(
  normalizeValue: (value: number) => NumericValue,
  config: Readonly<{
    step: number;
    defaultValue: NumericValue;
  }>
): Readonly<{
  reducer: Reducer<string, Action>;
  toValueNormalized: (valueStr: string) => NumericValue;
}> => {
  const toValueNormalized = (valueStr: string): NumericValue =>
    pipe(valueStr).chain(parseValue).chainOptional(normalizeValue).value ??
    config.defaultValue;

  const reducer: Reducer<string, Action> = (state, action) => {
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
            .chainOptional((v) =>
              match(action.type, {
                decrement: v - config.step,
                increment: v + config.step,
              })
            )
            .chainOptional(normalizeValue).value ?? config.defaultValue;

        return nextValue.toString();
      }
    }
  };

  return { reducer, toValueNormalized };
};
