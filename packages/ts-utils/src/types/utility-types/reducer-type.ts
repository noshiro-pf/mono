export type ReducerType<State, Action> = (
  state: State,
  action: Action
) => State;
