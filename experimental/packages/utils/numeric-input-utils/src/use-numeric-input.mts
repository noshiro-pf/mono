// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as React from 'react';

export const useNumericInputState = <N extends number>({
  valueFromProps,
  onValueChange,
  encode,
  decode,
}: Readonly<{
  valueFromProps: N;
  onValueChange: (value: N) => void;
  encode: (value: N) => string;
  decode: (s: string) => N;
}>): Readonly<{
  state: string;
  dirty: boolean;
  setState: (value: string) => void;
  submit: () => void;
}> => {
  const constants = React.useRef({
    onValueChange,
    encode,
    decode,
  });

  const [state, setState] = React.useState<string>(encode(valueFromProps));

  const dirty = React.useMemo(
    () => state !== constants.current.encode(valueFromProps),
    [state, valueFromProps],
  );

  React.useEffect(() => {
    setState(constants.current.encode(valueFromProps));
  }, [valueFromProps]);

  const submit = React.useCallback(() => {
    const decoded = constants.current.decode(state);

    const nextNumericState = decoded;
    const nextStringState = constants.current.encode(nextNumericState);

    setState(nextStringState);

    if (valueFromProps !== nextNumericState) {
      constants.current.onValueChange(nextNumericState);
    }
  }, [state, valueFromProps]);

  return {
    state,
    dirty,
    setState,
    submit,
  };
};
