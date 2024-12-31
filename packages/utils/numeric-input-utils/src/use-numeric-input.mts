// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as React from 'react';

export const useNumericInputState = <T extends number>({
  decode,
  encode,
  onValueChange,
  valueFromProps,
}: Readonly<{
  valueFromProps: T;
  onValueChange: (value: T) => void;
  encode: (s: T) => string;
  decode: (s: string) => T;
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
