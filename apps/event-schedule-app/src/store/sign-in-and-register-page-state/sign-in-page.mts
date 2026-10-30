import type { Toaster } from '@blueprintjs/core';
import { combine, filter, map, type InitializedObservable } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { Routes, dict } from '../../constants/index.mjs';
import {
  showToast,
  signInPageHasError,
  signInPageInitialState,
  signInPageStateReducer,
  type SignInPageState,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import type { AppRouter } from '../router-store.mjs';
import type { GoogleSignIn } from './google-sign-in-state.mjs';

export type SignInPageDeps = Readonly<{
  api: Readonly<{
    auth: Readonly<{
      /** Only whether it went through, and why not, is read. */
      signIn: (
        email: string,
        password: string,
      ) => Promise<
        Result<unknown, Readonly<{ code: string; message: string }>>
      >;
    }>;
  }>;
  router: StrictPick<AppRouter, 'isRoute' | 'pageToBack$' | 'redirect'>;
  /** Signing in waits while a Google sign-in is under way. */
  googleSignIn: StrictPick<GoogleSignIn, 'googleSignInButtonDisabledState'>;
  /** Where the page says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The sign-in page: the form, signing in through `deps.api`, and going back
 * to the page signing in was asked from.
 */
export const createSignInPageStore = (deps: SignInPageDeps): SignInPage => {
  const dc = dict.register;

  const left$ = deps.router.isRoute.signInPage$.pipe(
    filter((isPage) => !isPage),
  );

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

    const signInResult = await deps.api.auth.signIn(
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
            toast: deps.toast,
            message: dc.message.error.unknownErrorOnSignIn,
            intent: 'danger',
          });

          break;
      }
    } else {
      dispatch({ type: 'done' });

      showToast({
        toast: deps.toast,
        message: dc.message.success.signIn,
        intent: 'success',
      });

      if (pageToBack !== undefined) {
        deps.router.redirect(pageToBack);
      } else {
        deps.router.redirect(Routes.routes.createPage);
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
      deps.googleSignIn.googleSignInButtonDisabledState.getSnapshot().value
    ) {
      return;
    }

    // TODO: use toast
    submit(Optional.unwrap(deps.router.pageToBack$.getSnapshot())).catch(
      console.error,
    );
  };

  return {
    state,
    togglePasswordLock,
    inputEmailHandler,
    inputPasswordHandler,
    enterClickHandler,
  } as const;
};

export type SignInPage = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: SignInPageState;
      enterButtonDisabled: boolean;
      emailFormIntent: Intent;
      passwordFormIntent: Intent;
      passwordIsOpen: boolean;
    }>
  >;
  togglePasswordLock: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
  enterClickHandler: () => void;
}>;
