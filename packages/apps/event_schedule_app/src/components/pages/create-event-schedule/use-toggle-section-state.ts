import { useCallback, useEffect, useRef, useState } from 'react';

const NULL = Symbol();
const isNonNull = <T>(v: T | symbol): v is T => v !== NULL;

export const useToggleSectionState = <A>(
  defaultValue: A,
  initialValueWhenTurnedOn: A | symbol = NULL
): [
  boolean,
  (b: boolean) => void,
  () => void,
  A,
  (value: A) => void,
  () => void
] => {
  const defaultValueRef = useRef(defaultValue);
  const initialValueWhenTurnedOnRef = useRef(initialValueWhenTurnedOn);

  const [useThisConfig, setUseThisConfig] = useState<boolean>(false);

  const toggle = useCallback(() => {
    setUseThisConfig((b) => !b);
  }, []);

  const [value, setValue] = useState<A>(defaultValueRef.current);

  const resetValue = useCallback(() => {
    setValue(defaultValueRef.current);
  }, []);

  useEffect(() => {
    if (isNonNull(initialValueWhenTurnedOnRef.current)) {
      setValue(
        useThisConfig
          ? initialValueWhenTurnedOnRef.current
          : defaultValueRef.current
      );
    } else {
      if (!useThisConfig) {
        setValue(defaultValueRef.current);
      }
    }
  }, [useThisConfig]);

  return [useThisConfig, setUseThisConfig, toggle, value, setValue, resetValue];
};
