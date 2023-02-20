import {
  numericInputContinuousChangeDelay,
  numericInputContinuousChangeInterval,
} from './constants';
import { createNumericInputStateReducer } from './numeric-input-state';

export const useNumericInputState = <NumericValue extends number>({
  valueFromProps,
  onValueChange,
  initialState = '',
  normalizeValue,
  defaultValue,
  step,
}: Readonly<{
  valueFromProps: NumericValue;
  onValueChange: (value: NumericValue) => void;
  initialState?: string;
  normalizeValue: (valueStr: number) => NumericValue;
  defaultValue: NumericValue;
  step: number;
}>): Readonly<{
  valueAsStr: string;
  setValueStr: (value: string) => void;
  onInputBlur: () => void;
  onIncrementMouseDown: () => void;
  onDecrementMouseDown: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
}> => {
  const { reducer, toValueNormalized } = useMemo(
    () =>
      createNumericInputStateReducer(normalizeValue, {
        defaultValue,
        step,
      }),
    [defaultValue, step, normalizeValue]
  );

  const [state$, dispatch] = useObservableReducer(reducer, initialState);

  const valueAsStr = useObservableValue(state$);

  const ref1 = useRef({
    dispatch,
    onValueStrChange: (value: string) => {
      onValueChange(toValueNormalized(value));
    },
  });

  const setValueStr = useCallback((value: string) => {
    const r = ref1.current;
    r.dispatch({ type: 'set-string', value });
  }, []);

  useEffect(() => {
    setValueStr(valueFromProps.toString());
  }, [valueFromProps, setValueStr]);

  const onInputBlur = useCallback(() => {
    const r = ref1.current;
    r.onValueStrChange(r.dispatch({ type: 'normalize' }));
  }, []);

  const increment = useCallback(() => {
    const r = ref1.current;
    r.onValueStrChange(r.dispatch({ type: 'increment' }));
  }, []);

  const decrement = useCallback(() => {
    const r = ref1.current;
    r.onValueStrChange(r.dispatch({ type: 'decrement' }));
  }, []);

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

  const ref2 = useRef({
    increment,
    decrement,
    clearTimers,
  });

  const onIncrementMouseDown = useCallback(() => {
    const r = ref2.current;
    r.increment(); // execute once

    r.clearTimers();
    delayTimerRef.current = setTimeout(() => {
      intervalTimerRef.current = setInterval(
        r.increment,
        numericInputContinuousChangeInterval
      );
    }, numericInputContinuousChangeDelay);
  }, []);

  const onDecrementMouseDown = useCallback(() => {
    const r = ref2.current;
    r.decrement(); // execute once

    r.clearTimers();
    delayTimerRef.current = setTimeout(() => {
      intervalTimerRef.current = setInterval(
        r.decrement,
        numericInputContinuousChangeInterval
      );
    }, numericInputContinuousChangeDelay);
  }, []);

  useEffect(() => {
    const r = ref2.current;
    document.addEventListener('mouseup', r.clearTimers);
    return () => {
      document.removeEventListener('mouseup', r.clearTimers);
      r.clearTimers();
    };
  }, []);

  const onKeyDown = useMemo(() => {
    const r = ref2.current;

    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    return (ev: React.KeyboardEvent<HTMLDivElement>) => {
      switch (ev.key) {
        case 'ArrowUp':
          r.increment();
          ev.stopPropagation();
          break;

        case 'ArrowDown':
          r.decrement();
          ev.stopPropagation();
          break;
      }
    };
  }, []);

  return {
    valueAsStr,
    setValueStr,
    onInputBlur,
    onIncrementMouseDown,
    onDecrementMouseDown,
    onKeyDown,
  };
};
