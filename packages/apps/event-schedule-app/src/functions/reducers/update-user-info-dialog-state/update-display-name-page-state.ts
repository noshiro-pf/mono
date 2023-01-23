import {
  inputHasError,
  inputInitialState,
  inputStateReducer,
  type InputState,
} from '../input-state';

export type UpdateDisplayNamePageState = Readonly<{
  displayName: InputState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const updateDisplayNamePageInitialState = {
  displayName: inputInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const;

assertType<
  TypeExtends<
    typeof updateDisplayNamePageInitialState,
    UpdateDisplayNamePageState
  >
>();

export const updateDisplayNamePageHasError = (
  state: UpdateDisplayNamePageState
): boolean =>
  inputHasError(state.displayName) || state.otherErrors !== undefined;

export type UpdateDisplayNamePageStateAction = Readonly<
  | { type: 'done' }
  | { type: 'inputDisplayName'; payload: string }
  | { type: 'reset' }
  | { type: 'setDisplayNameError'; payload: string }
  | { type: 'setOtherError'; payload: string }
  | { type: 'submit' }
>;

export const updateDisplayNamePageStateReducer: Reducer<
  UpdateDisplayNamePageState,
  UpdateDisplayNamePageStateAction
> = (state, action) => {
  switch (action.type) {
    case 'inputDisplayName':
      return Obj.set(
        state,
        'displayName',
        inputStateReducer(state.displayName, {
          type: 'input',
          payload: action.payload,
        })
      );

    case 'setDisplayNameError':
      return {
        displayName: inputStateReducer(state.displayName, {
          type: 'setError',
          payload: action.payload,
        }),
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'setOtherError':
      return {
        displayName: state.displayName,
        otherErrors: action.payload,
        isWaitingResponse: false,
      };

    case 'submit': {
      return {
        displayName: state.displayName,
        otherErrors: undefined,
        isWaitingResponse: !inputHasError(state.displayName),
      };
    }

    case 'done':
      return Obj.set(state, 'isWaitingResponse', false);

    case 'reset':
      return updateDisplayNamePageInitialState;
  }
};
