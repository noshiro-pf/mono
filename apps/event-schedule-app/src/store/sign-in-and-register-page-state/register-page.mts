import { type InitializedObservable, derive, filter, map } from 'synstate';
import type { Href } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict, routes } from '../../constants/index.mjs';
import {
  type RegisterPageState,
  registerPageHasError,
  registerPageInitialState,
  registerPageStateReducer,
  showToast,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import type { AppRouter } from '../router-store.mjs';
import type { GoogleSignIn } from './google-sign-in-state.mjs';

export type RegisterPageDeps<User> = Readonly<{
  api: Readonly<{
    auth: Readonly<{
      createUser: (
        email: string,
        password: string,
      ) => Promise<Result<Readonly<{ user: User }>, AuthError>>;
      /** Given the user just created, as `createUser` handed it. */
      sendEmailVerification: (user: User) => Promise<Result<void, AuthError>>;
      update: Readonly<{
        displayName: (
          user: User,
          displayName: string,
        ) => Promise<Result<void, AuthError>>;
      }>;
    }>;
  }>;
  /**
   * Read again once the name is set: Firebase sets it on the user it holds and
   * reports no change.
   */
  auth: Readonly<{ emitAuthStateChange: () => void }>;
  router: StrictPick<
    AppRouter,
    'isActive' | 'pageToBack$' | 'replace' | 'trackVisit'
  >;
  /** Registering waits while a Google sign-in is under way. */
  googleSignIn: StrictPick<GoogleSignIn, 'googleSignInButtonDisabledState'>;
  /** Where the page says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The register page: the form, creating the user through `deps.api`, and going
 * back to the page registering was asked from.
 */
export const createRegisterPageStore = <User,>(
  deps: RegisterPageDeps<User>,
): RegisterPage => {
  const dc = dict.register;

  const left$ = deps.router
    .isActive(routes.register)
    .pipe(filter((isPage) => !isPage));

  const [formState$, dispatch] = createReducerWithActions(
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

  const state = derive(
    [
      formState$,
      enterButtonDisabled$,
      usernameFormIntent$,
      emailFormIntent$,
      passwordFormIntent$,
      passwordIsOpen$,
    ],
    (
      formState,
      enterButtonDisabled,
      usernameFormIntent,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    ) => ({
      formState,
      enterButtonDisabled,
      usernameFormIntent,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    }),
  );

  const submit = async (pageToBack: Href | undefined): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (registerPageHasError(s)) {
      return;
    }

    // A visit already left has no form to answer in and no page to leave. The
    // account, once made, is still finished and said to be made.
    const isCurrent = deps.router.trackVisit();

    const createUserResult = await deps.api.auth.createUser(
      s.email.inputValue,
      s.password.password.inputValue,
    );

    if (Result.isErr(createUserResult)) {
      if (!isCurrent()) {
        console.error(createUserResult.value);

        return;
      }

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
            toast: deps.toast,
            message: dc.message.error.unknownErrorOnRegister,
            intent: 'danger',
          });

          return;
      }
    }

    const user = createUserResult.value.user;

    const [updateProfileResult] = await Promise.all([
      deps.api.auth.update.displayName(user, s.username.inputValue),
      deps.api.auth.sendEmailVerification(user),
    ]);

    if (Result.isErr(updateProfileResult)) {
      // TODO: use toast
      console.error(updateProfileResult.value);

      if (isCurrent()) {
        dispatch({
          type: 'setUsernameError',
          payload: updateProfileResult.value.message,
        });
      }

      return;
    }

    deps.auth.emitAuthStateChange();

    showToast({
      toast: deps.toast,
      message: dc.message.success.register,
      intent: 'success',
    });

    if (!isCurrent()) {
      return;
    }

    dispatch({ type: 'done' });

    if (pageToBack !== undefined) {
      deps.router.replace(pageToBack);
    } else {
      deps.router.replace(routes.create.href());
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
    inputUsernameHandler,
    inputEmailHandler,
    inputPasswordHandler,
    inputPasswordConfirmationHandler,
    enterClickHandler,
  } as const;
};

export type RegisterPage = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: RegisterPageState;
      enterButtonDisabled: boolean;
      usernameFormIntent: Intent;
      emailFormIntent: Intent;
      passwordFormIntent: Intent;
      passwordIsOpen: boolean;
    }>
  >;
  togglePasswordLock: () => void;
  inputUsernameHandler: (value: string) => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
  inputPasswordConfirmationHandler: (value: string) => void;
  enterClickHandler: () => void;
}>;

type AuthError = Readonly<{ code: string; message: string }>;
