export type PasswordWithConfirmationState = DeepReadonly<{
  password: {
    inputValue: string;
    error: string | undefined;
  };
  passwordConfirmation: {
    inputValue: string;
    error: string | undefined;
  };
}>;

export const passwordWithConfirmationInitialState = {
  password: {
    inputValue: '',
    error: undefined,
  },
  passwordConfirmation: {
    inputValue: '',
    error: undefined,
  },
} as const satisfies PasswordWithConfirmationState;

export const passwordWithConfirmationHasError = (
  state: PasswordWithConfirmationState,
): boolean =>
  state.password.inputValue === '' ||
  state.passwordConfirmation.inputValue === '' ||
  state.password.error !== undefined ||
  state.passwordConfirmation.error !== undefined;

export type PasswordWithConfirmationStateAction = Readonly<
  | { type: 'inputPassword'; payload: string }
  | { type: 'inputPasswordConfirmation'; payload: string }
  | { type: 'reset' }
  | { type: 'setPasswordConfirmationError'; payload: string }
  | { type: 'setPasswordError'; payload: string }
  | { type: 'submit' }
>;

export const passwordWithConfirmationStateReducer: Reducer<
  PasswordWithConfirmationState,
  PasswordWithConfirmationStateAction
> = (state, action) => {
  switch (action.type) {
    case 'inputPassword': {
      const passwordInputValue = action.payload;

      return pipe(state)
        .chain((draft) =>
          Obj.setIn(
            draft,
            ['password', 'inputValue'],
            // if the last operation is backspace
            (state.password.error !== undefined ||
              state.passwordConfirmation.error !== undefined) &&
              state.password.inputValue.length ===
                passwordInputValue.length + 1 &&
              state.password.inputValue.slice(0, -1) === passwordInputValue
              ? ''
              : passwordInputValue,
          ),
        )
        .chain((draft) => Obj.setIn(draft, ['password', 'error'], undefined))
        .chain((draft) =>
          Obj.setIn(draft, ['passwordConfirmation', 'error'], undefined),
        ).value;
    }

    case 'inputPasswordConfirmation': {
      const passwordInputValue = action.payload;

      return pipe(state)
        .chain((draft) =>
          Obj.setIn(
            draft,
            ['passwordConfirmation', 'inputValue'],
            // if the last operation is backspace
            (state.password.error !== undefined ||
              state.passwordConfirmation.error !== undefined) &&
              state.password.inputValue.length ===
                passwordInputValue.length + 1 &&
              state.password.inputValue.slice(0, -1) === passwordInputValue
              ? ''
              : passwordInputValue,
          ),
        )
        .chain((draft) => Obj.setIn(draft, ['password', 'error'], undefined))
        .chain((draft) =>
          Obj.setIn(draft, ['passwordConfirmation', 'error'], undefined),
        ).value;
    }

    case 'setPasswordError':
      return Obj.setIn(state, ['password', 'error'], action.payload);

    case 'setPasswordConfirmationError':
      return Obj.setIn(
        state,
        ['passwordConfirmation', 'error'],
        action.payload,
      );

    case 'submit':
      return Obj.setIn(
        state,
        ['passwordConfirmation', 'error'],
        state.password.inputValue !== state.passwordConfirmation.inputValue
          ? dict.common.error.passwordNotMatch
          : undefined,
      );

    case 'reset':
      return passwordWithConfirmationInitialState;
  }
};
