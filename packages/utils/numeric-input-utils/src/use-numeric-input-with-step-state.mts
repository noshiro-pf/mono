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
  state: string;
  dirty: boolean;
  setState: (value: string) => void;
  submit: () => void;
  onIncrementMouseDown: () => void;
  onDecrementMouseDown: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
}> => {
  const constants = React.useRef({
    onValueChange,
    encode,
    decode,
    normalize,
    step,
  });

  const [state, setState] = React.useState<string>(
    constants.current.encode(valueFromProps),
  );

  React.useEffect(() => {
    setState(constants.current.encode(valueFromProps));
  }, [valueFromProps]);

  const updateStateFn = React.useCallback(
    (n: number, action: 'increment' | 'decrement' | 'normalize'): number => {
      switch (action) {
        case 'normalize':
          return n;

        case 'increment':
          return n + constants.current.step;

        case 'decrement':
          return n - constants.current.step;
      }
    },
    [],
  );

  const commonCallbackFn = React.useCallback(
    (action: 'increment' | 'decrement' | 'normalize') => {
      const decoded = constants.current.decode(state);

      const nextNumericState = constants.current.normalize(
        updateStateFn(decoded, action),
      );
      const nextStringState = constants.current.encode(nextNumericState);

      setState(nextStringState);

      if (valueFromProps !== nextNumericState) {
        constants.current.onValueChange(nextNumericState);
      }
    },
    [state, updateStateFn, valueFromProps],
  );

  const submit = React.useCallback(() => {
    commonCallbackFn('normalize');
  }, [commonCallbackFn]);

  const increment = React.useCallback(() => {
    commonCallbackFn('increment');
  }, [commonCallbackFn]);

  const decrement = React.useCallback(() => {
    commonCallbackFn('decrement');
  }, [commonCallbackFn]);

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

  const dirty = React.useMemo(
    () => state !== constants.current.encode(valueFromProps),
    [state, valueFromProps],
  );

  return {
    state,
    dirty,
    setState,
    submit,
    onIncrementMouseDown,
    onDecrementMouseDown,
    onKeyDown,
  };
};
