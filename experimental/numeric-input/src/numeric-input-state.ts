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
  const [valueAsStr, setValueAsStr] = React.useState(encode(valueFromProps));

  React.useEffect(() => {
    setValueAsStr(encode(valueFromProps));
  }, [valueFromProps, setValueAsStr, encode]);

  const submit = React.useCallback(() => {
    onValueChange(decode(valueAsStr));
  }, [decode, onValueChange, valueAsStr]);

  return {
    onValueAsStrChange: setValueAsStr,
    submit,
    valueAsStr,
  };
};
