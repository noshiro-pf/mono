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
  valueAsStr: string;
  setValueAsStr: (value: string) => void;
  submit: () => void;
}> => {
  const [valueAsStr, setValueAsStr] = React.useState<string>(
    encode(valueFromProps),
  );

  React.useEffect(() => {
    const nextValue = encode(valueFromProps);
    if (nextValue !== valueAsStr) {
      setValueAsStr(nextValue);
    }
  }, [valueFromProps, encode, valueAsStr]);

  const submit = React.useCallback(() => {
    const decoded = decode(valueAsStr);
    onValueChange(decoded);
    setValueAsStr(encode(decoded));
  }, [decode, encode, onValueChange, valueAsStr]);

  return {
    valueAsStr,
    setValueAsStr,
    submit,
  };
};
