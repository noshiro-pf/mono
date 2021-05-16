import type { MutableRefObject } from 'react';
import { useCallback, useRef, useState } from 'react';

// const NULL = Symbol();
// const isNonNull = <T>(v: T | symbol): v is T => v !== NULL;

export const useToggleSectionState = <A>(
  initialToggleState: boolean,
  initialValue: A,
  valueWhenTurnedOff: A,
  valueWhenTurnedOn?: A
): [
  boolean,
  (b: boolean) => void,
  () => void,
  A,
  (a: A) => void,
  () => void
] => {
  const initialValueRef = useRef(initialValue);
  const valueWhenTurnedOffRef: MutableRefObject<A> = useRef(valueWhenTurnedOff);
  const valueWhenTurnedOnRef: MutableRefObject<A | undefined> = useRef(
    valueWhenTurnedOn
  );

  const [useThisConfig, setUseThisConfig] = useState<boolean>(
    initialToggleState
  );

  const turnOn = useCallback(() => {
    setUseThisConfig(true);
    if (valueWhenTurnedOnRef.current !== undefined) {
      setValue(valueWhenTurnedOnRef.current);
    }
  }, []);

  const turnOff = useCallback(() => {
    setUseThisConfig(false);
    setValue(valueWhenTurnedOffRef.current);
  }, []);

  const toggle = useCallback(() => {
    if (useThisConfig) {
      turnOff();
    } else {
      turnOn();
    }
  }, [useThisConfig, turnOff, turnOn]);

  const [value, setValue] = useState<A>(initialValueRef.current);

  const resetValue = useCallback(() => {
    setValue(initialValueRef.current);
  }, []);

  return [useThisConfig, setUseThisConfig, toggle, value, setValue, resetValue];
};
