import { type InitializedObservable, combine, filter, map } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { Routes, dict } from '../../constants/index.mjs';
import {
  createToaster,
  resetPasswordPageHasError,
  resetPasswordPageInitialState,
  resetPasswordPageStateReducer,
  showToast,
} from '../../functions/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import { Router } from '../store.mjs';

const dc = dict.register;

const toast = createToaster();

const [, dispatch, { state: formState$ }] = createReducerWithActions(
  resetPasswordPageStateReducer,
  resetPasswordPageInitialState,
  [
    Router.isRoute.signInPage$
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

const state = combine([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
]).pipe(
  map(([formState, enterButtonDisabled, emailFormIntent]) => ({
    formState,
    enterButtonDisabled,
    emailFormIntent,
  })),
);

const submit = async (pageToBack: string | undefined): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (resetPasswordPageHasError(s)) {
    return;
  }

  const sendPasswordResetEmailResult = await api.auth.sendPasswordResetEmail(
    s.email.inputValue,
  );

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
          toast,
          message: dc.message.error.unknownErrorOnSendingResetPasswordEmail,
          intent: 'danger',
        });

        return;
    }
  }

  dispatch({ type: 'done' });

  showToast({
    toast,
    message: dc.message.success.sendPasswordResetEmail,
    intent: 'success',
  });

  if (pageToBack !== undefined) {
    Router.redirect(pageToBack);
  } else {
    Router.redirect(Routes.routes.createPage);
  }
};

const enterClickHandler = (): void => {
  if (enterButtonDisabled$.getSnapshot().value) {
    return;
  }

  // TODO: use toast
  submit(Optional.unwrap(Router.pageToBack$.getSnapshot())).catch(
    console.error,
  );
};

const inputEmailHandler = (value: string): void => {
  dispatch({ type: 'inputEmail', payload: value });
};

export const ResetPasswordPageStore = {
  state,
  enterClickHandler,
  inputEmailHandler,
} as const;
