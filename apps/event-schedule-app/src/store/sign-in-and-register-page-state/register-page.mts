import { type InitializedObservable, combine, filter, map } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { Routes, dict } from '../../constants/index.mjs';
import {
  createToaster,
  registerPageHasError,
  registerPageInitialState,
  registerPageStateReducer,
  showToast,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import { Router } from '../router.mjs';
import { GoogleSignInStore } from './google-sign-in-state.mjs';

const dc = dict.register;

const toast = createToaster();

const left$ = Router.isRoute.registerPage$.pipe(filter((isPage) => !isPage));

const [, dispatch, { state: formState$ }] = createReducerWithActions(
  registerPageStateReducer,
  registerPageInitialState,
  [left$.pipe(map(() => ({ type: 'reset' }) as const))],
);

const enterButtonDisabled$ = formState$.pipe(
  map((st) => st.isWaitingResponse || registerPageHasError(st)),
);

const usernameFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.username.error === undefined ? 'primary' : 'danger')),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) =>
    st.password.password.error === undefined &&
    st.password.passwordConfirmation.error === undefined
      ? 'primary'
      : 'danger',
  ),
);

const { state: passwordIsOpen$, toggle: togglePasswordLock } =
  createToggleState([left$]);

const state = combine([
  formState$,
  enterButtonDisabled$,
  usernameFormIntent$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpen$,
]).pipe(
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

  if (registerPageHasError(s)) {
    return;
  }

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

  showToast({ toast, message: dc.message.success.register, intent: 'success' });

  if (pageToBack !== undefined) {
    Router.redirect(pageToBack);
  } else {
    Router.redirect(Routes.routes.createPage);
  }
};

const inputUsernameHandler = (value: string): void => {
  dispatch({ type: 'inputUsername', payload: value });
};

const inputEmailHandler = (value: string): void => {
  dispatch({ type: 'inputEmail', payload: value });
};

const inputPasswordHandler = (value: string): void => {
  dispatch({ type: 'inputPassword', payload: value });
};

const inputPasswordConfirmationHandler = (value: string): void => {
  dispatch({ type: 'inputPasswordConfirmation', payload: value });
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

export const RegisterPageStore = {
  state,
  togglePasswordLock,
  inputUsernameHandler,
  inputEmailHandler,
  inputPasswordHandler,
  inputPasswordConfirmationHandler,
  enterClickHandler,
} as const;
