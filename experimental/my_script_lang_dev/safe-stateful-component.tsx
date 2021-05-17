import { ReactElement, useEffect, useReducer, useRef } from 'react';
import { usePrevious } from './use-previous';

type ReducerStateWithLastAction<State, ActionType extends string> = {
  state: State;
  lastAction: ActionType | undefined;
};
type ReducerWithLastAction<
  State,
  ActionType extends string,
  Action extends { type: ActionType }
> = (
  state: ReducerStateWithLastAction<State, ActionType>,
  action: Action
) => ReducerStateWithLastAction<State, ActionType>;

const toReducerWithLastAction =
  <State, ActionType extends string, Action extends { type: ActionType }>(
    reducer: (state: State, action: Action) => State
  ): ReducerWithLastAction<State, ActionType, Action> =>
  (
    stateWithLastAction: ReducerStateWithLastAction<State, ActionType>,
    action: Action
  ) => ({
    state: reducer(stateWithLastAction.state, action),
    lastAction: action.type,
  });

export const component = <
  Props,
  State,
  ActionType extends string,
  Action extends { type: ActionType }
>({
  initialState,
  reducer,
  view,
  effect,
  componentName = '',
}: {
  initialState: State;
  reducer: (state: State, action: Action) => State;
  view: (props: Props, state: State) => ReactElement;
  effect?: ({
    actionType,
    props,
    stateBeforeAction,
    stateAfterAction,
  }: {
    actionType: ActionType;
    props: Props;
    stateBeforeAction?: State;
    stateAfterAction: State;
    dispatch: React.Dispatch<Action>;
  }) => void;
  componentName?: string;
}) =>
  memoNamed<Props>(componentName, (props) => {
    const propsImmutable = useRef(props);

    const [state, dispatch] = useReducer(
      toReducerWithLastAction<State, ActionType, Action>(reducer),
      {
        state: initialState,
        lastAction: undefined,
      }
    );

    const prevState = usePrevious(state);

    useEffect(() => {
      if (state.lastAction !== undefined && effect !== undefined) {
        effect({
          actionType: state.lastAction,
          props: propsImmutable.current,
          stateBeforeAction: prevState?.state,
          stateAfterAction: state.state,
          dispatch,
        });
      }
    }, [state]);

    return view(propsImmutable.current, state.state);
  });

component.name = 'component';

// export const SafeStatefulComponent = component<{}, {}, '', { type: '' }>(
//   (state, action) => state,
//   undefined,
//   undefined
// );
