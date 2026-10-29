import { type InitializedObservable, combine, filter, map } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { Routes, dict } from '../../constants/index.mjs';
import {
  createToaster,
  showToast,
  signInPageHasError,
  signInPageInitialState,
  signInPageStateReducer,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import { Router } from '../store.mjs';
import { GoogleSignInStore } from './google-sign-in-state.mjs';

const dc = dict.register;

const toast = createToaster();

const left$ = Router.isRoute.signInPage$.pipe(filter((isPage) => !isPage));

const [, dispatch, { state: formState$ }] = createReducerWithActions(
  signInPageStateReducer,
  signInPageInitialState,
  [left$.pipe(map(() => ({ type: 'reset' }) as const))],
);

const enterButtonDisabled$ = formState$.pipe(
  map((st) => st.isWaitingResponse || signInPageHasError(st)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.password.error === undefined ? 'primary' : 'danger')),
);

const { state: passwordIsOpen$, toggle: togglePasswordLock } =
  createToggleState([left$]);

const state = combine([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpen$,
]).pipe(
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

  if (signInPageHasError(s)) {
    return;
  }

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

    showToast({ toast, message: dc.message.success.signIn, intent: 'success' });

    if (pageToBack !== undefined) {
      Router.redirect(pageToBack);
    } else {
      Router.redirect(Routes.routes.createPage);
    }
  }
};

const inputEmailHandler = (value: string): void => {
  dispatch({ type: 'inputEmail', payload: value });
};

const inputPasswordHandler = (value: string): void => {
  dispatch({ type: 'inputPassword', payload: value });
};

const enterClickHandler = (): void => {
  if (
    enterButtonDisabled$.getSnapshot().value ||
    GoogleSignInStore.googleSignInButtonDisabledState.getSnapshot().value
  ) {
    return;
  }

  // TODO: use toast
  submit(Optional.unwrap(Router.pageToBack$.getSnapshot())).catch(
    console.error,
  );
};

export const SignInPageStore = {
  state,
  togglePasswordLock,
  inputEmailHandler,
  inputPasswordHandler,
  enterClickHandler,
} as const;
