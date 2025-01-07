import {
  useObservableReducer,
  useObservableValue,
} from '@noshiro/syncflow-react-hooks';
import { match, pipe } from '@noshiro/ts-utils';
import { useCallback, useEffect, useRef } from 'react';

export const numericInputContinuousChangeDelay = 400;
export const numericInputContinuousChangeInterval = 40;

export const useNumericInputState = <N extends number>({
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
  const reducer = useRef(
    createNumericInputStateReducer({
      decode,
      encode,
      normalizeValue: normalize,
      step,
    }),
  );

  // NOTE: dispatch の返り値を使うため useReducer ではなく useObservableReducer を使っている
  const [stateObservable, dispatch] = useObservableReducer(
    reducer.current,
    encode(valueFromProps),
  );

  useEffect(() => {
    const nextValue = encode(valueFromProps);
    if (nextValue !== stateObservable.getSnapshot().value) {
      dispatch({ type: 'setValue', value: nextValue });
    }
  }, [valueFromProps, encode, dispatch, stateObservable]);

  const submit = useCallback(() => {
    const nextState = dispatch({ type: 'submit' });
    onValueChange(decode(nextState));
  }, [decode, dispatch, onValueChange]);

  const increment = useCallback(() => {
    const nextState = dispatch({ type: 'increment' });
    onValueChange(decode(nextState));
  }, [dispatch, onValueChange, decode]);

  const decrement = useCallback(() => {
    const nextState = dispatch({ type: 'decrement' });
    onValueChange(decode(nextState));
  }, [onValueChange, decode, dispatch]);

  const delayTimerRef = useRef<TimerId | undefined>(undefined);
  const intervalTimerRef = useRef<TimerId | undefined>(undefined);

  const clearTimers = useCallback(() => {
    if (delayTimerRef.current !== undefined) {
      clearTimeout(delayTimerRef.current);
    }
    if (intervalTimerRef.current !== undefined) {
      clearInterval(intervalTimerRef.current);
    }
  }, []);

  const startLoop = useCallback(
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

  const onIncrementMouseDown = useCallback(() => {
    startLoop(increment);
  }, [increment, startLoop]);

  const onDecrementMouseDown = useCallback(() => {
    startLoop(decrement);
  }, [decrement, startLoop]);

  useEffect(() => {
    document.addEventListener('mouseup', clearTimers);
    document.addEventListener('keyup', clearTimers);
    return () => {
      document.removeEventListener('mouseup', clearTimers);
      document.removeEventListener('keyup', clearTimers);
      clearTimers();
    };
  }, [clearTimers]);

  const onKeyDown = useCallback(
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

  const valueAsStr = useObservableValue(stateObservable);

  const setValueAsStr = useCallback(
    (value: string) => {
      dispatch({ type: 'setValue', value });
    },
    [dispatch],
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

type NumericInputStateReducerAction = Readonly<
  | { type: 'setValue'; value: string }
  | { type: 'decrement' }
  | { type: 'increment' }
  | { type: 'submit' }
>;

const createNumericInputStateReducer =
  <N extends number>({
    encode,
    decode,
    normalizeValue,
    step,
  }: Readonly<{
    encode: (s: N) => string;
    decode: (s: string) => N;
    normalizeValue: (value: number) => N;
    step: number;
  }>): Reducer<string, NumericInputStateReducerAction> =>
  (state, action) => {
    switch (action.type) {
      case 'setValue':
        return action.value;

      case 'submit':
        return pipe(state).chain(decode).chain(normalizeValue).chain(encode)
          .value;

      case 'increment':
      case 'decrement':
        return pipe(state)
          .chain(decode)
          .chain((v) =>
            match(action.type, {
              decrement: v - step,
              increment: v + step,
            }),
          )
          .chain(normalizeValue)
          .chain(encode).value;
    }
  };
