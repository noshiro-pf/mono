import { useState } from '@noshiro/react-utils';
import { useCallback } from 'react';

// const NULL = Symbol();
// const isNonNull = <T>(v: T | symbol): v is T => v !== NULL;

export type ToggleSectionState<A> = Readonly<{
  toggleState: boolean;
  toggle: () => void;
  value: A;
  setValue: (a: A) => void;
  resetState: () => void;
}>;

export const useToggleSectionState = <A>({
  initialToggleState,
  initialState,
  valueToBeSetWhenTurnedOff,
  valueToBeSetWhenTurnedOn,
}: Readonly<{
  initialToggleState: boolean;
  initialState: A;
  valueToBeSetWhenTurnedOff: A;
  valueToBeSetWhenTurnedOn?: A;
}>): ToggleSectionState<A> => {
  const { state: toggleState, setState: setToggleState } =
    useState<boolean>(initialToggleState);

  const { state: value, setState: setValue } = useState<A>(initialState);

  const { toggle, resetState } = useToggleSectionStateManager({
    initialToggleState,
    initialState,
    valueToBeSetWhenTurnedOff,
    valueToBeSetWhenTurnedOn,
    toggleState,
    setToggleState,
    setValue,
  });

  return {
    toggleState,
    toggle,
    value,
    setValue,
    resetState,
  };
};

type ToggleSectionManagerState = Readonly<{
  toggle: () => void;
  resetState: () => void;
}>;

const useToggleSectionStateManager = <A>({
  initialToggleState,
  initialState,
  valueToBeSetWhenTurnedOff,
  valueToBeSetWhenTurnedOn,
  toggleState: useThisConfig,
  setToggleState: setUseThisConfig,
  setValue,
}: Readonly<{
  initialToggleState: boolean;
  initialState: A;
  valueToBeSetWhenTurnedOff: A;
  valueToBeSetWhenTurnedOn?: A;
  toggleState: boolean;
  setToggleState: (b: boolean) => void;
  setValue: (a: A) => void;
}>): ToggleSectionManagerState => {
  const turnOn = useCallback(() => {
    setUseThisConfig(true);
    if (valueToBeSetWhenTurnedOn !== undefined) {
      setValue(valueToBeSetWhenTurnedOn);
    }
  }, [valueToBeSetWhenTurnedOn, setUseThisConfig, setValue]);

  const turnOff = useCallback(() => {
    setUseThisConfig(false);
    setValue(valueToBeSetWhenTurnedOff);
  }, [valueToBeSetWhenTurnedOff, setUseThisConfig, setValue]);

  const toggle = useCallback(() => {
    if (useThisConfig) {
      turnOff();
    } else {
      turnOn();
    }
  }, [useThisConfig, turnOff, turnOn]);

  const resetState = useCallback(() => {
    setUseThisConfig(initialToggleState);
    setValue(initialState);
  }, [initialToggleState, initialState, setValue, setUseThisConfig]);

  return { toggle, resetState };
};
