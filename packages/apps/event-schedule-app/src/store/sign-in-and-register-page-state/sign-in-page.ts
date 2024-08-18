import { api } from '../../api';
import { Routes } from '../../constants';
import {
  createToaster,
  showToast,
  signInPageHasError,
  signInPageInitialState,
  signInPageStateReducer,
} from '../../functions';
import { Router } from '../router';
import { GoogleSignInStore } from './google-sign-in-state';

const dc = dict.register;

const toast = createToaster();

const { state: formState$, dispatch } = createReducer(
  signInPageStateReducer,
  signInPageInitialState,
);

const enterButtonDisabled$ = formState$.chain(
  map((st) => st.isWaitingResponse || signInPageHasError(st)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) => (st.password.error === undefined ? 'primary' : 'danger')),
);

const {
  state: passwordIsOpen$,
  setFalse: hidePassword,
  toggle: togglePasswordLock,
} = createBooleanState(false);

const state = combine([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpen$,
]).chain(
  map(
    ([
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    ]) => ({
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    }),
  ),
);

const submit = async (pageToBack: string | undefined): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (signInPageHasError(s)) return;

  const signInResult = await api.auth.signIn(
    s.email.inputValue,
    s.password.inputValue,
  );

  if (Result.isErr(signInResult)) {
    switch (signInResult.value.code) {
      case 'auth/user-not-found':
        dispatch({
          type: 'setEmailError',
          payload: dict.register.message.error.userNotFound,
        });
        break;

      case 'auth/wrong-password':
        dispatch({
          type: 'setPasswordError',
          payload: dict.register.message.error.wrongPassword,
        });
        break;

      default:
        console.error(signInResult.value);

        dispatch({
          type: 'setOtherError',
          payload: signInResult.value.message,
        });

        showToast({
          toast,
          message: dc.message.error.unknownErrorOnSignIn,
          intent: 'danger',
        });
        break;
    }
  } else {
    dispatch({ type: 'done' });

    showToast({
      toast,
      message: dc.message.success.signIn,
      intent: 'success',
    });

    if (pageToBack !== undefined) {
      Router.redirect(pageToBack);
    } else {
      Router.redirect(Routes.routes.createPage);
    }
  }
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

const enterClickHandler = (): void => {
  if (
    enterButtonDisabled$.snapshot.value ||
    GoogleSignInStore.googleSignInButtonDisabledState.snapshot.value
  )
    return;

  // TODO: use toast
  submit(Maybe.unwrap(Router.pageToBack$.snapshot)).catch(console.error);
};

const resetAllState = (): void => {
  dispatch({ type: 'reset' });
  hidePassword();
};

/* subscriptions */

Router.isRoute.signInPage$.subscribe((isSignInPage) => {
  if (!isSignInPage) {
    resetAllState();
  }
});

export const SignInPageStore = {
  state,
  togglePasswordLock,
  inputEmailHandler,
  inputPasswordHandler,
  enterClickHandler,
} as const;
