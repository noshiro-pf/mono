import { type InitializedObservable, derive, filter, map } from 'synstate';
import type { Href } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../../api/index.mjs';
import { dict, routes } from '../../constants/index.mjs';
import {
  type ResetPasswordPageState,
  resetPasswordPageHasError,
  resetPasswordPageInitialState,
  resetPasswordPageStateReducer,
  showToast,
} from '../../functions/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import type { AppRouter } from '../router-store.mjs';

export type ResetPasswordPageDeps = Readonly<{
  api: Readonly<{ auth: StrictPick<Api['auth'], 'sendPasswordResetEmail'> }>;
  router: StrictPick<
    AppRouter,
    'isActive' | 'pageToBack$' | 'replace' | 'trackVisit'
  >;
  /** Where the page says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The reset-password form on the sign-in page, and sending the email through
 * `deps.api`.
 */
export const createResetPasswordPageStore = (
  deps: ResetPasswordPageDeps,
): ResetPasswordPage => {
  const dc = dict.register;

  const [formState$, dispatch] = createReducerWithActions(
    resetPasswordPageStateReducer,
    resetPasswordPageInitialState,
    [
      deps.router
        .isActive(routes.signIn)
        .pipe(filter((isSignInPage) => !isSignInPage))
        .pipe(map(() => ({ type: 'reset' }) as const)),
    ],
  );

  const enterButtonDisabled$ = formState$.pipe(
    map((st) => st.isWaitingResponse || resetPasswordPageHasError(st)),
  );

  const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
  );

  const state = derive(
    [formState$, enterButtonDisabled$, emailFormIntent$],
    (formState, enterButtonDisabled, emailFormIntent) => ({
      formState,
      enterButtonDisabled,
      emailFormIntent,
    }),
  );

  const submit = async (pageToBack: Href | undefined): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (resetPasswordPageHasError(s)) {
      return;
    }

    const isCurrent = deps.router.trackVisit();

    const sendPasswordResetEmailResult =
      await deps.api.auth.sendPasswordResetEmail(s.email.inputValue);

    // A visit already left has no form to answer in and no page to leave: a
    // success still says so, and an error is only logged.
    if (!isCurrent()) {
      if (Result.isOk(sendPasswordResetEmailResult)) {
        showToast({
          toast: deps.toast,
          message: dc.message.success.sendPasswordResetEmail,
          intent: 'success',
        });
      } else {
        console.error(sendPasswordResetEmailResult.value);
      }

      return;
    }

    if (Result.isErr(sendPasswordResetEmailResult)) {
      switch (sendPasswordResetEmailResult.value.code) {
        case 'auth/user-not-found':
          dispatch({
            type: 'setEmailError',
            payload: dict.register.message.error.userNotFound,
          });

          return;

        default:
          console.error(sendPasswordResetEmailResult.value);

          dispatch({
            type: 'setOtherError',
            payload: sendPasswordResetEmailResult.value.message,
          });

          showToast({
            toast: deps.toast,
            message: dc.message.error.unknownErrorOnSendingResetPasswordEmail,
            intent: 'danger',
          });

          return;
      }
    }

    dispatch({ type: 'done' });

    showToast({
      toast: deps.toast,
      message: dc.message.success.sendPasswordResetEmail,
      intent: 'success',
    });

    if (pageToBack !== undefined) {
      deps.router.replace(pageToBack);
    } else {
      deps.router.replace(routes.create.href());
    }
  };

  const enterClickHandler = (): void => {
    if (enterButtonDisabled$.getSnapshot().value) {
      return;
    }

    // TODO: use toast
    submit(Optional.unwrap(deps.router.pageToBack$.getSnapshot())).catch(
      console.error,
    );
  };

  const inputEmailHandler = (value: string): void => {
    dispatch({ type: 'inputEmail', payload: value });
  };

  return {
    state,
    enterClickHandler,
    inputEmailHandler,
  } as const;
};

export type ResetPasswordPage = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: ResetPasswordPageState;
      enterButtonDisabled: boolean;
      emailFormIntent: Intent;
    }>
  >;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
}>;
