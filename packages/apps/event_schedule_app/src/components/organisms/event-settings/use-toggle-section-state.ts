import { useCallback, useRef, useState } from 'react';

// const NULL = Symbol();
// const isNonNull = <T>(v: T | symbol): v is T => v !== NULL;

export type ToggleSectionState<A> = Readonly<{
  useThisConfig: boolean;
  setUseThisConfig: (b: boolean) => void;
  toggle: () => void;
  value: A;
  setValue: (a: A) => void;
  resetValue: () => void;
}>;

export type ToggleSectionManagerState = Readonly<{
  toggle: () => void;
  resetValue: () => void;
}>;

export const useToggleSectionState = <A>({
  initialToggleState,
  defaultValue,
  valueWhenTurnedOff,
  valueWhenTurnedOn,
}: Readonly<{
  initialToggleState: boolean;
  defaultValue: A;
  valueWhenTurnedOff: A;
  valueWhenTurnedOn?: A;
}>): ToggleSectionState<A> => {
  const [useThisConfig, setUseThisConfig] =
    useState<boolean>(initialToggleState);

  const [value, setValue] = useState<A>(defaultValue);

  const { toggle, resetValue } = useToggleSectionStateManager({
    defaultValue,
    valueWhenTurnedOff,
    valueWhenTurnedOn,
    useThisConfig,
    setUseThisConfig,
    setValue,
  });

  return {
    useThisConfig,
    setUseThisConfig,
    toggle,
    value,
    setValue,
    resetValue,
  };
};

export const useToggleSectionStateManager = <A>({
  defaultValue,
  valueWhenTurnedOff,
  valueWhenTurnedOn,
  useThisConfig,
  setUseThisConfig,
  setValue,
}: Readonly<{
  defaultValue: A;
  valueWhenTurnedOff: A;
  valueWhenTurnedOn?: A;
  useThisConfig: boolean;
  setUseThisConfig: (b: boolean) => void;
  setValue: (a: A) => void;
}>): ToggleSectionManagerState => {
  const ref = useRef({
    defaultValue,
    valueWhenTurnedOn,
    valueWhenTurnedOff,
    setUseThisConfig,
    setValue,
  });

  const turnOn = useCallback(() => {
    ref.current.setUseThisConfig(true);
    if (ref.current.valueWhenTurnedOn !== undefined) {
      ref.current.setValue(ref.current.valueWhenTurnedOn);
    }
  }, []);

  const turnOff = useCallback(() => {
    ref.current.setUseThisConfig(false);
    ref.current.setValue(ref.current.valueWhenTurnedOff);
  }, []);

  const toggle = useCallback(() => {
    if (useThisConfig) {
      turnOff();
    } else {
      turnOn();
    }
  }, [useThisConfig, turnOff, turnOn]);

  const resetValue = useCallback(() => {
    ref.current.setValue(ref.current.defaultValue);
  }, []);

  return { toggle, resetValue };
};
