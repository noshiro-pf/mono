import { derive, filter, map, type InitializedObservable } from 'synstate';
import type { Href } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict, routes } from '../../constants/index.mjs';
import {
  credentialErrorOf,
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
  router: StrictPick<
    AppRouter,
    'isActive' | 'pageToBack$' | 'replace' | 'trackVisit'
  >;
  /** Signing in waits while a Google sign-in is under way. */
  googleSignIn: StrictPick<GoogleSignIn, 'googleSignInButtonDisabledState'>;
  /** Where the page says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The sign-in page: the form, signing in through `deps.api`, and going back to
 * the page signing in was asked from.
 */
export const createSignInPageStore = (deps: SignInPageDeps): SignInPage => {
  const dc = dict.register;

  const left$ = deps.router
    .isActive(routes.signIn)
    .pipe(filter((isPage) => !isPage));

  const [formState$, dispatch] = createReducerWithActions(
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

  const state = derive(
    [
      formState$,
      enterButtonDisabled$,
      emailFormIntent$,
      passwordFormIntent$,
      passwordIsOpen$,
    ],
    (
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    ) => ({
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    }),
  );

  const submit = async (pageToBack: Href | undefined): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (signInPageHasError(s)) {
      return;
    }

    const isCurrent = deps.router.trackVisit();

    const signInResult = await deps.api.auth.signIn(
      s.email.inputValue,
      s.password.inputValue,
    );

    // A visit already left has no form to answer in and no page to leave: a
    // success still says so, and an error is only logged.
    if (!isCurrent()) {
      if (Result.isOk(signInResult)) {
        showToast({
          toast: deps.toast,
          message: dc.message.success.signIn,
          intent: 'success',
        });
      } else {
        console.error(signInResult.value);
      }

      return;
    }

    if (Result.isErr(signInResult)) {
      switch (credentialErrorOf(signInResult.value.code)) {
        case 'userNotFound':
          dispatch({
            type: 'setEmailError',
            payload: dc.message.error.userNotFound,
          });

          break;

        case 'wrongPassword':
          dispatch({
            type: 'setPasswordError',
            payload: dc.message.error.wrongPassword,
          });

          break;

        case 'wrongEmailOrPassword':
          dispatch({
            type: 'setPasswordError',
            payload: dc.message.error.wrongEmailOrPassword,
          });

          break;

        case undefined:
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
        deps.router.replace(pageToBack);
      } else {
        deps.router.replace(routes.create.href());
      }
    }
  };

  const inputEmailHandler = (value: string): void => {
    const s = dispatch({ type: 'inputEmail', payload: value });

    // That message may be about the email, so changing the email answers it as
    // well as retyping the password does.
    if (s.password.error === dc.message.error.wrongEmailOrPassword) {
      dispatch({ type: 'inputPassword', payload: s.password.inputValue });
    }
  };

  const inputPasswordHandler = (value: string): void => {
    dispatch({ type: 'inputPassword', payload: value });
  };

  const enterClickHandler = (): void => {
    if (
      Optional.unwrap(enterButtonDisabled$.getSnapshot()) ||
      Optional.unwrap(
        deps.googleSignIn.googleSignInButtonDisabledState.getSnapshot(),
      )
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
