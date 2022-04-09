export type ToggleSectionState<A> = Readonly<{
  toggleState$: InitializedObservable<boolean>;
  toggle: () => void;
  value$: InitializedObservable<A>;
  setValue: (a: A) => void;
  resetState: () => void;
}>;

export const createToggleSectionState = <A>({
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
  const toggleState = createBooleanState(initialToggleState);

  const { state$: value$, setState: setValue } = createState<A>(initialState);

  const { toggle, resetState } = createToggleSectionStateManager<A>({
    toggleState,
    initialState,
    valueToBeSetWhenTurnedOff,
    valueToBeSetWhenTurnedOn,
    setValue,
  });

  return {
    toggleState$: toggleState.state$,
    toggle,
    value$,
    setValue,
    resetState,
  };
};

type ToggleSectionManagerState = Readonly<{
  toggle: () => void;
  resetState: () => void;
}>;

const createToggleSectionStateManager = <A>({
  toggleState,
  initialState,
  valueToBeSetWhenTurnedOff,
  valueToBeSetWhenTurnedOn,
  setValue,
}: Readonly<{
  toggleState: Readonly<{
    setTrue: () => void;
    setFalse: () => void;
    toggle: () => boolean;
    reset: () => void;
  }>;
  initialState: A;
  valueToBeSetWhenTurnedOff: () => A;
  valueToBeSetWhenTurnedOn?: () => A;
  setValue: (a: A) => void;
}>): ToggleSectionManagerState => {
  const toggle = (): void => {
    const nextState = toggleState.toggle();

    if (nextState) {
      if (valueToBeSetWhenTurnedOn !== undefined) {
        setValue(valueToBeSetWhenTurnedOn());
      }
    } else {
      setValue(valueToBeSetWhenTurnedOff());
    }
  };

  const resetState = (): void => {
    toggleState.reset();
    setValue(initialState);
  };

  return { toggle, resetState };
};
