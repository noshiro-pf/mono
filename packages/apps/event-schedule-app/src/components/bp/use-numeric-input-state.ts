import { useValueAsRef } from '@noshiro/react-utils';
import {
  numericInputContinuousChangeDelay,
  numericInputContinuousChangeInterval,
} from './constants';
import {
  createNumericInputStateReducer,
  parseValue,
} from './numeric-input-state';

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
  const reducer = useRef(
    createNumericInputStateReducer({
      defaultValue,
      step,
    }),
  );

  const [state, dispatch] = useObservableReducer(reducer.current, {
    value: initialState,
    normalizerFn: normalizeValue,
  });

  const { value: valueAsStr, normalizerFn } = useObservableValue(state);

  const onValueStrChange = useCallback(
    (value: string) => {
      onValueChange(normalizerFn(parseValue(value) ?? defaultValue));
    },
    [onValueChange, normalizerFn, defaultValue],
  );

  const setValueStr = useCallback(
    (value: string) => {
      dispatch({ type: 'set-string', value });
    },
    [dispatch],
  );

  const valueAsStrRef = useValueAsRef(valueAsStr);

  useEffect(() => {
    if (valueFromProps.toString() !== valueAsStrRef.current) {
      setValueStr(valueFromProps.toString());
    }
  }, [valueFromProps, setValueStr, valueAsStrRef]);

  const normalizerFnRef = useValueAsRef(normalizerFn);

  useEffect(() => {
    if (normalizeValue !== normalizerFnRef.current) {
      dispatch({ type: 'set-normalizer-fn', normalizerFn: normalizeValue });
    }
  }, [dispatch, normalizeValue, normalizerFnRef]);

  const onInputBlur = useCallback(() => {
    onValueStrChange(dispatch({ type: 'normalize' }).value);
  }, [onValueStrChange, dispatch]);

  const increment = useCallback(() => {
    onValueStrChange(dispatch({ type: 'increment' }).value);
  }, [onValueStrChange, dispatch]);

  const decrement = useCallback(() => {
    onValueStrChange(dispatch({ type: 'decrement' }).value);
  }, [onValueStrChange, dispatch]);

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

  const onIncrementMouseDown = useCallback(() => {
    increment(); // execute once

    clearTimers();
    delayTimerRef.current = setTimeout(() => {
      intervalTimerRef.current = setInterval(
        increment,
        numericInputContinuousChangeInterval,
      );
    }, numericInputContinuousChangeDelay);
  }, [clearTimers, increment]);

  const onDecrementMouseDown = useCallback(() => {
    decrement(); // execute once

    clearTimers();
    delayTimerRef.current = setTimeout(() => {
      intervalTimerRef.current = setInterval(
        decrement,
        numericInputContinuousChangeInterval,
      );
    }, numericInputContinuousChangeDelay);
  }, [clearTimers, decrement]);

  useEffect(() => {
    document.addEventListener('mouseup', clearTimers);
    return () => {
      document.removeEventListener('mouseup', clearTimers);
      clearTimers();
    };
  }, [clearTimers]);

  const onKeyDown = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: React.KeyboardEvent<HTMLDivElement>) => {
        switch (ev.key) {
          case 'ArrowUp':
            increment();
            ev.stopPropagation();
            break;

          case 'ArrowDown':
            decrement();
            ev.stopPropagation();
            break;

          default:
            break;
        }
      },
    [decrement, increment],
  );

  return {
    valueAsStr,
    setValueStr,
    onInputBlur,
    onIncrementMouseDown,
    onDecrementMouseDown,
    onKeyDown,
  };
};
