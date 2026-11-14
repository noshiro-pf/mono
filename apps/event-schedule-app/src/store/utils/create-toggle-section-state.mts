import {
  type InitializedObservable,
  createBooleanState,
  createState,
} from 'synstate';
import { Optional } from 'ts-data-forge';

export type ToggleSectionState<A> = Readonly<{
  toggleState$: InitializedObservable<boolean>;
  toggle: () => void;
  turnOn: () => void;
  turnOff: () => void;
  value$: InitializedObservable<A>;
  setValue: (a: A) => void;
  updateValue: (fn: (a: A) => A) => void;
  resetState: () => void;
}>;

export const createToggleSectionState = <A,>({
  initialToggleState,
  initialState,
  valueToBeSetWhenTurnedOff,
  valueToBeSetWhenTurnedOn,
}: Readonly<{
  initialToggleState: boolean;
  initialState: A;
  valueToBeSetWhenTurnedOff: () => A;
  valueToBeSetWhenTurnedOn?: () => A;
}>): ToggleSectionState<A> => {
  const [toggleState$, toggleState] = createBooleanState(initialToggleState);

  const [value$, setValue, { updateState: updateValue }] =
    createState<A>(initialState);

  const { toggle, resetState, turnOff, turnOn } =
    createToggleSectionStateManager<A>({
      toggleState$,
      toggleState,
      initialState,
      valueToBeSetWhenTurnedOff,
      valueToBeSetWhenTurnedOn,
      setValue,
    });

  return {
    toggleState$,
    toggle,
    value$,
    setValue,
    updateValue,
    resetState,
    turnOff,
    turnOn,
  };
};

type ToggleSectionManagerState = Readonly<{
  toggle: () => void;
  turnOn: () => void;
  turnOff: () => void;
  resetState: () => void;
}>;

const createToggleSectionStateManager = <A,>({
  toggleState$,
  toggleState,
  initialState,
  valueToBeSetWhenTurnedOff,
  valueToBeSetWhenTurnedOn,
  setValue,
}: Readonly<{
  toggleState$: InitializedObservable<boolean>;
  toggleState: Readonly<{
    setTrue: () => void;
    setFalse: () => void;
    resetState: () => void;
  }>;
  initialState: A;
  valueToBeSetWhenTurnedOff: () => A;
  valueToBeSetWhenTurnedOn?: () => A;
  setValue: (a: A) => void;
}>): ToggleSectionManagerState => {
  // Turning the section off clears its value, and turning it on sets the one
  // given for that, whether from the switch or from an event being loaded: a
  // section keeps nothing from before.
  const turnOff = (): void => {
    toggleState.setFalse();

    setValue(valueToBeSetWhenTurnedOff());
  };

  const turnOn = (): void => {
    toggleState.setTrue();

    if (valueToBeSetWhenTurnedOn !== undefined) {
      setValue(valueToBeSetWhenTurnedOn());
    }
  };

  const toggle = (): void => {
    if (Optional.unwrap(toggleState$.getSnapshot())) {
      turnOff();
    } else {
      turnOn();
    }
  };

  const resetState = (): void => {
    toggleState.resetState();

    setValue(initialState);
  };

  return {
    toggle,
    resetState,
    turnOff,
    turnOn,
  };
};
