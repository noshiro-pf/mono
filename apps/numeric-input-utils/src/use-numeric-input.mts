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
  // No explicit type argument: `encode` gives it, and the React Compiler rule
  // reads `useState<string>(…)` as a reference to the hook rather than a call.
  const [state, setState] = React.useState(encode(valueFromProps));

  // `encode`, `decode` and `onValueChange` used to be held in a ref so that a
  // caller passing them inline did not re-run the effect that reset the text.
  // Reading a ref during render is what the React Compiler rejects, and the
  // ref bought little — see the reset below, which no longer is an effect.
  const dirty = state !== encode(valueFromProps);

  // When the value arrives changed from outside, the text is reset to match.
  // Written as React's "adjusting state when a prop changes" recipe rather
  // than an effect: an effect would render once with the stale text and then
  // again with the new one, and the React Compiler rejects deriving state from
  // props that way.
  const [previousValue, setPreviousValue] = React.useState(valueFromProps);

  if (previousValue !== valueFromProps) {
    setPreviousValue(valueFromProps);

    setState(encode(valueFromProps));
  }

  const submit = React.useCallback(() => {
    const nextNumericState = decode(state);

    setState(encode(nextNumericState));

    if (valueFromProps !== nextNumericState) {
      onValueChange(nextNumericState);
    }
  }, [state, valueFromProps, encode, decode, onValueChange]);

  return {
    state,
    dirty,
    setState,
    submit,
  };
};
