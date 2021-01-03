import { useCallback, useEffect, useRef, useState } from 'react';

// const NULL = Symbol();
// const isNonNull = <T>(v: T | symbol): v is T => v !== NULL;

export const useToggleSectionState = <A>(
  initialToggleState: boolean,
  initialValue: A,
  valueWhenTurnedOff: A
): [
  boolean,
  (b: boolean) => void,
  () => void,
  A,
  (value: A) => void,
  () => void
] => {
  const initialValueRef = useRef(initialValue);
  const valueWhenTurnedOffRef: React.MutableRefObject<A> = useRef(
    valueWhenTurnedOff
  );

  const [useThisConfig, setUseThisConfig] = useState<boolean>(
    initialToggleState
  );

  const toggle = useCallback(() => {
    setUseThisConfig((b) => !b);
  }, []);

  const [value, setValue] = useState<A>(initialValueRef.current);

  const resetValue = useCallback(() => {
    setValue(initialValueRef.current);
  }, []);

  useEffect(() => {
    if (!useThisConfig) {
      setValue(valueWhenTurnedOffRef.current);
    }
  }, [useThisConfig]);

  return [useThisConfig, setUseThisConfig, toggle, value, setValue, resetValue];
};
