import { api } from '../../api';
import { Routes } from '../../constants';
import {
  createToaster,
  registerPageHasError,
  registerPageInitialState,
  registerPageStateReducer,
  showToast,
} from '../../functions';
import { Router } from '../router';
import { GoogleSignInStore } from './google-sign-in-state';

const dc = dict.register;

const toast = createToaster();

const { state: formState$, dispatch } = createReducer(
  registerPageStateReducer,
  registerPageInitialState,
);

const enterButtonDisabled$ = formState$.chain(
  map((st) => st.isWaitingResponse || registerPageHasError(st)),
);

const usernameFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) => (st.username.error === undefined ? 'primary' : 'danger')),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) =>
    st.password.password.error === undefined &&
    st.password.passwordConfirmation.error === undefined
      ? 'primary'
      : 'danger',
  ),
);

const {
  state: passwordIsOpen$,
  setFalse: hidePassword,
  toggle: togglePasswordLock,
} = createBooleanState(false);

const state = combine([
  formState$,
  enterButtonDisabled$,
  usernameFormIntent$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpen$,
]).chain(
  map(
    ([
      formState,
      enterButtonDisabled,
      usernameFormIntent,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    ]) => ({
      formState,
      enterButtonDisabled,
      usernameFormIntent,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    }),
  ),
);

const submit = async (pageToBack: string | undefined): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (registerPageHasError(s)) return;

  const createUserResult = await api.auth.createUser(
    s.email.inputValue,
    s.password.password.inputValue,
  );

  if (Result.isErr(createUserResult)) {
    switch (createUserResult.value.code) {
      case 'auth/invalid-email':
        dispatch({
          type: 'setEmailError',
          payload: dc.message.error.invalidEmail,
        });
        return;

      case 'auth/email-already-in-use':
        dispatch({
          type: 'setEmailError',
          payload: dc.message.error.emailAlreadyInUse,
        });
        return;

      case 'auth/weak-password':
        dispatch({
          type: 'setPasswordError',
          payload: dc.message.error.weakPassword,
        });

        return;

      default:
        console.error(createUserResult.value);

        dispatch({
          type: 'setOtherError',
          payload: createUserResult.value.message,
        });

        showToast({
          toast,
          message: dc.message.error.unknownErrorOnRegister,
          intent: 'danger',
        });
        return;
    }
  }

  const user = createUserResult.value.user;

  const [updateProfileResult] = await Promise.all([
    api.auth.update.displayName(user, s.username.inputValue),
    api.auth.sendEmailVerification(user),
  ]);

  if (Result.isErr(updateProfileResult)) {
    // TODO: use toast
    console.error(updateProfileResult.value);
    dispatch({
      type: 'setUsernameError',
      payload: updateProfileResult.value.message,
    });
    return;
  }

  dispatch({ type: 'done' });

  showToast({
    toast,
    message: dc.message.success.register,
    intent: 'success',
  });

  if (pageToBack !== undefined) {
    Router.redirect(pageToBack);
  } else {
    Router.redirect(Routes.routes.createPage);
  }
};

const inputUsernameHandler = (value: string): void => {
  dispatch({
    type: 'inputUsername',
    payload: value,
  });
};

const inputEmailHandler = (value: string): void => {
  dispatch({
    type: 'inputEmail',
    payload: value,
  });
};

const inputPasswordHandler = (value: string): void => {
  dispatch({
    type: 'inputPassword',
    payload: value,
  });
};

const inputPasswordConfirmationHandler = (value: string): void => {
  dispatch({
    type: 'inputPasswordConfirmation',
    payload: value,
  });
};

const enterClickHandler = (): void => {
  if (
    enterButtonDisabled$.getSnapshot().value ||
    GoogleSignInStore.googleSignInButtonDisabledState.getSnapshot().value
  )
    return;

  // TODO: use toast
  submit(Maybe.unwrap(Router.pageToBack$.getSnapshot())).catch(console.error);
};

const resetAllState = (): void => {
  dispatch({ type: 'reset' });
  hidePassword();
};

Router.isRoute.registerPage$.subscribe((isRegisterPage) => {
  if (!isRegisterPage) {
    resetAllState();
  }
});

export const RegisterPageStore = {
  state,
  togglePasswordLock,
  inputUsernameHandler,
  inputEmailHandler,
  inputPasswordHandler,
  inputPasswordConfirmationHandler,
  enterClickHandler,
} as const;
