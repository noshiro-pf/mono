// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as React from 'react';

export const numericInputContinuousChangeDelay = 400;
export const numericInputContinuousChangeInterval = 40;

export const useNumericInputWithStepState = <N extends number>({
  valueFromProps,
  onValueChange,
  encode,
  decode,
  normalize,
  step,
}: Readonly<{
  valueFromProps: N;
  onValueChange: (value: N) => void;
  encode: (value: N) => string;
  decode: (s: string) => N;
  normalize: (value: number) => N;
  step: number;
}>): Readonly<{
  valueAsStr: string;
  setValueAsStr: (value: string) => void;
  submit: () => void;
  onIncrementMouseDown: () => void;
  onDecrementMouseDown: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
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

  const updateStateFn = React.useCallback(
    (action: 'increment' | 'decrement' | 'normalize') =>
      (state: string): string => {
        const decoded = decode(state);
        switch (action) {
          case 'normalize':
            return encode(normalize(decoded));

          case 'increment':
            return encode(normalize(decoded + step));

          case 'decrement':
            return encode(normalize(decoded - step));
        }
      },
    [decode, encode, normalize, step],
  );

  const commonCallbackFn = React.useCallback(
    (updater: MonoTypeFunction<string>) => {
      const nextState = updater(valueAsStr);
      onValueChange(decode(nextState));
      setValueAsStr(updater);
    },
    [decode, onValueChange, valueAsStr],
  );

  const submit = React.useCallback(() => {
    commonCallbackFn(updateStateFn('normalize'));
  }, [updateStateFn, commonCallbackFn]);

  const increment = React.useCallback(() => {
    commonCallbackFn(updateStateFn('increment'));
  }, [updateStateFn, commonCallbackFn]);

  const decrement = React.useCallback(() => {
    commonCallbackFn(updateStateFn('decrement'));
  }, [updateStateFn, commonCallbackFn]);

  const delayTimerRef = React.useRef<TimerId | undefined>(undefined);
  const intervalTimerRef = React.useRef<TimerId | undefined>(undefined);

  const clearTimers = React.useCallback(() => {
    if (delayTimerRef.current !== undefined) {
      clearTimeout(delayTimerRef.current);
    }
    if (intervalTimerRef.current !== undefined) {
      clearInterval(intervalTimerRef.current);
    }
  }, []);

  const startLoop = React.useCallback(
    (fn: () => void) => {
      fn(); // execute once

      clearTimers();

      delayTimerRef.current = setTimeout(() => {
        intervalTimerRef.current = setInterval(
          fn,
          numericInputContinuousChangeInterval,
        );
      }, numericInputContinuousChangeDelay);
    },
    [clearTimers],
  );

  const onIncrementMouseDown = React.useCallback(() => {
    startLoop(increment);
  }, [increment, startLoop]);

  const onDecrementMouseDown = React.useCallback(() => {
    startLoop(decrement);
  }, [decrement, startLoop]);

  React.useEffect(() => {
    document.addEventListener('mouseup', clearTimers);
    document.addEventListener('keyup', clearTimers);
    return () => {
      document.removeEventListener('mouseup', clearTimers);
      document.removeEventListener('keyup', clearTimers);
      clearTimers();
    };
  }, [clearTimers]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      switch (ev.key) {
        case 'ArrowUp':
          startLoop(increment);
          ev.stopPropagation();
          break;

        case 'ArrowDown':
          startLoop(decrement);
          ev.stopPropagation();
          break;

        default:
          break;
      }
    },
    [startLoop, increment, decrement],
  );

  return {
    valueAsStr,
    setValueAsStr,
    submit,
    onIncrementMouseDown,
    onDecrementMouseDown,
    onKeyDown,
  };
};
