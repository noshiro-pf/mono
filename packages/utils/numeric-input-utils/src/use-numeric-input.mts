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
  encode: (s: N) => string;
  decode: (s: string) => N;
}>): Readonly<{
  valueAsStr: string;
  onValueAsStrChange: (value: string) => void;
  submit: () => void;
}> => {
  const [valueAsStr, setValueAsStr] = React.useState<string>(
    encode(valueFromProps),
  );

  React.useEffect(() => {
    setValueAsStr(encode(valueFromProps));
  }, [valueFromProps, encode]);

  const submit = React.useCallback(() => {
    const decoded = decode(valueAsStr);
    onValueChange(decoded);
    setValueAsStr(encode(decoded));
  }, [decode, encode, onValueChange, valueAsStr]);

  return {
    onValueAsStrChange: setValueAsStr,
    submit,
    valueAsStr,
  };
};
